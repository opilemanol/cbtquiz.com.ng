import type { Subject, Topic, Question, ExamAttempt, UserReport } from '../types';
import { INITIAL_SUBJECTS, INITIAL_TOPICS, INITIAL_QUESTIONS } from '../lib/seedData';
import { db, auth } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  limit as firestoreLimit,
  writeBatch,
} from 'firebase/firestore';

// ---------------- FIRESTORE ERROR HANDLING ----------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function cleanForFirestore(obj: any): any {
  if (obj === undefined || obj === null) return undefined;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore).filter((v) => v !== undefined);
  }
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined && val !== null) {
      const cleanedVal = cleanForFirestore(val);
      if (cleanedVal !== undefined) {
        cleaned[key] = cleanedVal;
      }
    }
  }
  return cleaned;
}

// Helper to shuffle an array (unbiased Fisher-Yates shuffle)
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Normalize subject identifier so variations like "Use of English", "accounting", "accounts", "math"
 * all map cleanly to canonical subjectId.
 */
export function normalizeSubjectId(raw: string): string {
  const clean = (raw || '').trim().toLowerCase();
  if (!clean) return 'english';
  if (clean === 'eng' || clean.includes('english')) return 'english';
  if (clean === 'mth' || clean === 'math' || clean === 'maths' || clean.includes('mathematic')) return 'mathematics';
  if (clean === 'phy' || clean.includes('physic')) return 'physics';
  if (clean === 'chm' || clean === 'chem' || clean.includes('chemist')) return 'chemistry';
  if (clean === 'bio' || clean.includes('biolog')) return 'biology';
  if (clean === 'eco' || clean === 'econ' || clean.includes('economic')) return 'economics';
  if (clean === 'gov' || clean === 'govt' || clean.includes('government')) return 'government';
  if (clean === 'lit' || clean.includes('literature')) return 'literature';
  if (clean === 'tlc' || clean.includes('life changer') || clean.includes('life_changer')) return 'life_changer';
  if (clean === 'com' || clean.includes('commerce')) return 'commerce';
  if (clean === 'acc' || clean.includes('account')) return 'accounts';
  if (clean === 'agr' || clean.includes('agric')) return 'agriculture';
  if (clean === 'crk' || clean === 'crs' || clean.includes('christian')) return 'crk';
  if (clean === 'geo' || clean.includes('geograph')) return 'geography';
  if (clean === 'frn' || clean.includes('french')) return 'french';
  if (clean === 'his' || clean.includes('histor')) return 'history';
  if (clean === 'art' || clean.includes('fine art') || clean.includes('fine_art')) return 'fine_art';
  if (clean === 'hau' || clean.includes('hausa')) return 'hausa';
  if (clean === 'arb' || clean.includes('arabic')) return 'arabic';
  return clean.replace(/\s+/g, '_');
}

/**
 * Automatically scans question text for LaTeX delimiters like '\(' and '\[' and wraps them in a span with the 'math-display' class
 * so that KaTeX can render them reliably, ensuring square roots (\sqrt{x}) and other complex symbols are formatted correctly.
 */
export function processLatexInText(text: string): string {
  if (!text) return '';
  let str = text;

  // 1. Convert inline LaTeX delimiters \( ... \) to $...$
  str = str.replace(/\\\(([\s\S]+?)\\\)/g, (_m, expr) => `$${expr.trim()}$`);

  // 2. Convert block LaTeX delimiters \[ ... \] to display math wrapped in a span with the 'math-display' class
  str = str.replace(/\\\[([\s\S]+?)\\\]/g, (_m, expr) => `<span class="math-display block my-2 text-center">$${expr.trim()}$</span>`);

  // 3. Normalize raw square root expressions like \sqrt{x} or sqrt(x)
  str = str.replace(/(?<!\$)\\sqrt\s*\{([^}]+)\}/g, '$\\sqrt{$1}$');
  str = str.replace(/sqrt\s*\(([^)]+)\)/gi, '$\\sqrt{$1}$');

  return str;
}

/**
 * Normalizes question object supporting the user's specific schema
 */
export function normalizeQuestion(raw: Record<string, any>, fallbackId?: string): Question | null {
  if (!raw) return null;
  if (raw.active === false) return null;

  const rawQuestionText = String(
    raw.questionText ?? raw.question ?? raw.text ?? raw.prompt ?? ''
  ).trim();
  if (!rawQuestionText) return null;
  const questionText = processLatexInText(rawQuestionText);

  // Extract options array
  let options: string[] = [];
  if (Array.isArray(raw.options) && raw.options.length >= 2) {
    options = raw.options.slice(0, 4).map((o: any) =>
      processLatexInText(typeof o === 'string' ? o : String(o?.text ?? o?.label ?? o ?? ''))
    );
  } else if (raw.options && typeof raw.options === 'object') {
    options = [
      String(raw.options.A ?? raw.options.a ?? ''),
      String(raw.options.B ?? raw.options.b ?? ''),
      String(raw.options.C ?? raw.options.c ?? ''),
      String(raw.options.D ?? raw.options.d ?? ''),
    ].filter((s) => s !== '').map((s) => processLatexInText(s));
  } else if (raw.optionA !== undefined || raw.a !== undefined) {
    options = [
      String(raw.optionA ?? raw.a ?? ''),
      String(raw.optionB ?? raw.b ?? ''),
      String(raw.optionC ?? raw.c ?? ''),
      String(raw.optionD ?? raw.d ?? ''),
    ].map((s) => processLatexInText(s));
  }

  if (options.length < 2) return null;
  while (options.length < 4) {
    options.push(`Option ${String.fromCharCode(65 + options.length)}`);
  }

  // Extract correctAnswerIndex (0..3)
  let correctAnswerIndex = 0;
  const rawAns =
    raw.correctAnswerIndex ??
    raw.correctIndex ??
    raw.correctAnswer ??
    raw.answer ??
    raw.correctOption ??
    0;

  if (typeof rawAns === 'number' && rawAns >= 0 && rawAns <= 3) {
    correctAnswerIndex = rawAns;
  } else if (typeof rawAns === 'string') {
    const cleanAns = rawAns.trim().toUpperCase();
    if (cleanAns === 'A' || cleanAns === '0') correctAnswerIndex = 0;
    else if (cleanAns === 'B' || cleanAns === '1') correctAnswerIndex = 1;
    else if (cleanAns === 'C' || cleanAns === '2') correctAnswerIndex = 2;
    else if (cleanAns === 'D' || cleanAns === '3') correctAnswerIndex = 3;
    else {
      const matchIdx = options.findIndex(
        (opt) => opt.trim().toLowerCase() === rawAns.trim().toLowerCase()
      );
      if (matchIdx >= 0) correctAnswerIndex = matchIdx;
    }
  }

  const rawSubject = String(raw.subjectId || raw.subject || raw.subjectName || 'general');
  const normalizedSubjId = normalizeSubjectId(rawSubject);
  const matchedSubj = INITIAL_SUBJECTS.find((s) => s.id === normalizedSubjId);

  const rawPassage = raw.passage || raw.context ? String(raw.passage || raw.context) : undefined;
  const rawSolution = raw.solution || raw.explanation ? String(raw.solution || raw.explanation) : undefined;

  return {
    id: String(raw.id || fallbackId || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
    subjectId: normalizedSubjId,
    subjectName: String(raw.subjectName || matchedSubj?.name || raw.subject || normalizedSubjId),
    topicId: raw.topicId ? String(raw.topicId) : undefined,
    topicName: raw.topicName || raw.topic ? String(raw.topicName || raw.topic) : undefined,
    passage: rawPassage ? processLatexInText(rawPassage) : undefined,
    questionText,
    options,
    correctAnswerIndex,
    solution: rawSolution ? processLatexInText(rawSolution) : undefined,
    difficulty: raw.difficulty || 'medium',
    year: raw.year || 'JAMB UTME',
    examType: raw.examType || 'JAMB UTME',
    active: true,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Deduplicate a list of questions by ID and normalized text
 */
export function deduplicateQuestions(questions: Question[]): Question[] {
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();
  const unique: Question[] = [];

  for (const q of questions) {
    const idKey = (q.id || '').trim().toLowerCase();
    const textKey = (q.questionText || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

    if (!textKey) continue;
    if ((idKey && seenIds.has(idKey)) || seenTexts.has(textKey)) {
      continue;
    }

    if (idKey) seenIds.add(idKey);
    seenTexts.add(textKey);
    unique.push(q);
  }

  return unique;
}

// ---------------- LOCAL JSON FILE QUESTION SERVICE (NO FIRESTORE / NO PERSISTENT CACHING ON LAUNCH) ----------------

let sessionQuestionsCache: Question[] | null = null;

export async function fetchQuestionsFromJson(): Promise<Question[]> {
  if (sessionQuestionsCache) {
    return sessionQuestionsCache;
  }
  try {
    const res = await fetch('/data/questions.json');
    if (!res.ok) {
      throw new Error(`Failed to load /data/questions.json: ${res.statusText}`);
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      const normalized: Question[] = [];
      for (let i = 0; i < data.length; i++) {
        const norm = normalizeQuestion(data[i], `q_${i}`);
        if (norm) normalized.push(norm);
      }
      sessionQuestionsCache = deduplicateQuestions(normalized);
      return sessionQuestionsCache;
    }
  } catch (err) {
    console.warn('Error fetching /data/questions.json, falling back to INITIAL_QUESTIONS:', err);
  }
  return deduplicateQuestions(INITIAL_QUESTIONS);
}

/**
 * Fetch questions from local /data/questions.json for a specific subject.
 */
export async function getQuestionsBySubject(subjectId: string): Promise<Question[]> {
  const canonicalId = normalizeSubjectId(subjectId);
  const all = await fetchQuestionsFromJson();
  const matches = all.filter((q) => normalizeSubjectId(q.subjectId) === canonicalId);
  if (matches.length > 0) {
    return matches;
  }
  return INITIAL_QUESTIONS.filter((q) => normalizeSubjectId(q.subjectId) === canonicalId);
}

export const FIRESTORE_UPGRADE_URL = '#';

export function isQuotaError(err: any): boolean {
  return false;
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> {
  return promise;
}

/**
 * Check connection status of question dataset.
 */
export async function checkFirestoreLiveStatus(): Promise<{
  connected: boolean;
  quotaExceeded: boolean;
  count: number;
  message?: string;
}> {
  const all = await fetchQuestionsFromJson();
  return {
    connected: true,
    quotaExceeded: false,
    count: all.length,
    message: 'Using local dataset (/data/questions.json)'
  };
}

/**
 * Fetch all questions from local /data/questions.json.
 */
export async function getAllQuestionsFromStorage(): Promise<Question[]> {
  return await fetchQuestionsFromJson();
}

/**
 * Save a single question in session memory.
 */
export async function saveQuestion(question: Question): Promise<void> {
  const all = await fetchQuestionsFromJson();
  const index = all.findIndex((q) => q.id === question.id);
  const cleaned = normalizeQuestion(question, question.id);
  if (!cleaned) return;
  if (index >= 0) {
    all[index] = cleaned;
  } else {
    all.unshift(cleaned);
  }
  sessionQuestionsCache = deduplicateQuestions(all);
}

/**
 * Delete a single question from session memory.
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  const all = await fetchQuestionsFromJson();
  sessionQuestionsCache = all.filter((q) => q.id !== questionId);
}

/**
 * Bulk import questions into session memory.
 */
export async function bulkImportQuestions(
  items: any[],
  replaceAll = false,
  onProgress?: (message: string) => void
): Promise<{ added: number; total: number; errors: string[] }> {
  const errors: string[] = [];
  const normalizedItems: Question[] = [];

  onProgress?.('Validating question schema and normalizing LaTeX...');
  for (let i = 0; i < items.length; i++) {
    const raw = items[i];
    const norm = normalizeQuestion(raw, `import_${Date.now()}_${i}`);
    if (norm) {
      normalizedItems.push(norm);
    } else {
      errors.push(`Row ${i + 1}: Invalid question format (missing questionText or options)`);
    }
  }

  if (normalizedItems.length === 0) {
    return { added: 0, total: 0, errors };
  }

  const current = replaceAll ? [] : await fetchQuestionsFromJson();
  const combined = [...normalizedItems, ...current];
  sessionQuestionsCache = deduplicateQuestions(combined);
  onProgress?.(`Successfully loaded ${normalizedItems.length} questions into question bank.`);

  return { added: normalizedItems.length, total: sessionQuestionsCache.length, errors };
}

/**
 * Empty question bank in session memory.
 */
export async function emptyQuestionBank(): Promise<void> {
  sessionQuestionsCache = [];
}

/**
 * Return subjects list
 */
export async function getSubjects(): Promise<Subject[]> {
  return INITIAL_SUBJECTS;
}

/**
 * Return topics for a subject
 */
export async function getTopics(subjectId: string): Promise<Topic[]> {
  const canonicalId = normalizeSubjectId(subjectId);
  return INITIAL_TOPICS.filter((t) => t.subjectId === canonicalId);
}

/**
 * Prepare exam questions based on user configuration from LIVE Firestore database.
 * Guarantees ZERO duplicate questions within a single attempt.
 */
export async function prepareExamQuestions(
  subjectConfigs: Array<{
    subjectId: string;
    subjectName: string;
    questionCount: number;
    selectedTopics?: string[];
  }>,
  shuffleQuestions: boolean,
  shuffleOptions: boolean
): Promise<Array<{
  question: Question;
  displayOptions: string[];
  originalIndicesMap: number[]; // maps display index -> original question.options index
}>> {
  const result: Array<{
    question: Question;
    displayOptions: string[];
    originalIndicesMap: number[];
  }> = [];

  const sessionSeenIds = new Set<string>();
  const sessionSeenTexts = new Set<string>();

  for (const config of subjectConfigs) {
    let allQuestions = await getQuestionsBySubject(config.subjectId);

    // Filter out any questions already selected in this test session
    allQuestions = allQuestions.filter((q) => {
      const idKey = q.id.trim().toLowerCase();
      const textKey = q.questionText.trim().toLowerCase().replace(/\s+/g, ' ');
      return !sessionSeenIds.has(idKey) && !sessionSeenTexts.has(textKey);
    });

    // Always randomize/shuffle candidatePool to guarantee questions are randomized on every new attempt
    let candidatePool = shuffleArray(allQuestions);

    // Filter by topic if specified
    if (config.selectedTopics && config.selectedTopics.length > 0) {
      const topicSet = new Set(config.selectedTopics);
      const filteredByTopic = allQuestions.filter((q) => q.topicId && topicSet.has(q.topicId));
      const remaining = allQuestions.filter((q) => !q.topicId || !topicSet.has(q.topicId));
      candidatePool = [
        ...shuffleArray(filteredByTopic),
        ...shuffleArray(remaining)
      ];
    }

    if (candidatePool.length === 0) {
      continue;
    }

    const chosen = candidatePool.slice(0, config.questionCount);

    for (const q of chosen) {
      const idKey = q.id.trim().toLowerCase();
      const textKey = q.questionText.trim().toLowerCase().replace(/\s+/g, ' ');
      sessionSeenIds.add(idKey);
      sessionSeenTexts.add(textKey);

      let displayOptions = [...q.options];
      let originalIndicesMap = [0, 1, 2, 3];

      if (shuffleOptions) {
        const indexed = displayOptions.map((opt, idx) => ({ opt, originalIdx: idx }));
        const shuffled = shuffleArray(indexed);
        displayOptions = shuffled.map((item) => item.opt);
        originalIndicesMap = shuffled.map((item) => item.originalIdx);
      }

      result.push({
        question: q,
        displayOptions,
        originalIndicesMap,
      });
    }
  }

  return result;
}

/**
 * Save an exam attempt to LIVE Firestore database and local storage.
 */
export async function saveExamAttempt(attempt: ExamAttempt): Promise<string> {
  const localKey = `jamb_attempt_${attempt.id}`;
  localStorage.setItem(localKey, JSON.stringify(attempt));

  try {
    const listRaw = localStorage.getItem('jamb_attempts_history');
    const history: ExamAttempt[] = listRaw ? JSON.parse(listRaw) : [];
    const existingIndex = history.findIndex((h) => h.id === attempt.id);
    if (existingIndex >= 0) {
      history[existingIndex] = attempt;
    } else {
      history.unshift(attempt);
    }
    localStorage.setItem('jamb_attempts_history', JSON.stringify(history.slice(0, 30)));
  } catch (e) {
    console.warn('Local history storage failed:', e);
  }

  // Persist live attempt in Firestore collection 'examAttempts'
  try {
    await setDoc(doc(db, 'examAttempts', attempt.id), cleanForFirestore({
      ...attempt,
      submittedAt: attempt.submittedAt || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Failed to save attempt to Firestore:', err);
  }

  return attempt.id;
}

/**
 * Get exam attempt by ID
 */
export async function getExamAttempt(attemptId: string): Promise<ExamAttempt | null> {
  // Check local cache first
  const localKey = `jamb_attempt_${attemptId}`;
  const local = localStorage.getItem(localKey);
  if (local) {
    try {
      return JSON.parse(local) as ExamAttempt;
    } catch {
      // continue to firestore
    }
  }

  // Query Firestore
  try {
    const snap = await getDoc(doc(db, 'examAttempts', attemptId));
    if (snap.exists()) {
      return snap.data() as ExamAttempt;
    }
  } catch (err) {
    console.warn('Failed to fetch attempt from Firestore:', err);
  }

  return null;
}

/**
 * Get past attempts for a user
 */
export async function getUserAttempts(username?: string): Promise<ExamAttempt[]> {
  try {
    const local = localStorage.getItem('jamb_attempts_history');
    if (local) {
      const history = JSON.parse(local) as ExamAttempt[];
      if (username) {
        return history.filter((h) => h.username.toLowerCase() === username.toLowerCase());
      }
      return history;
    }
  } catch {
    // empty
  }
  return [];
}

/**
 * Submit an error report
 */
export async function submitErrorReport(report: UserReport): Promise<void> {
  const reportDoc = {
    ...report,
    id: `rep_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  try {
    await setDoc(doc(db, 'reports', reportDoc.id), cleanForFirestore(reportDoc));
  } catch (err) {
    console.warn('Error saving report to Firestore:', err);
  }

  try {
    const existing = JSON.parse(localStorage.getItem('jamb_reports') || '[]');
    existing.unshift(reportDoc);
    localStorage.setItem('jamb_reports', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save report to local storage:', e);
  }
}

/**
 * Get all reports for admin
 */
export async function getAdminReports(): Promise<UserReport[]> {
  try {
    const snap = await getDocs(query(collection(db, 'reports'), firestoreLimit(50)));
    if (!snap.empty) {
      const list: UserReport[] = [];
      snap.forEach((d) => list.push(d.data() as UserReport));
      return list;
    }
  } catch (err) {
    console.warn('Failed to fetch reports from Firestore:', err);
  }

  try {
    return JSON.parse(localStorage.getItem('jamb_reports') || '[]');
  } catch {
    return [];
  }
}

/**
 * Questions for admin
 */
export async function getAdminQuestions(subjectId?: string): Promise<Question[]> {
  const all = await getAllQuestionsFromStorage();
  if (subjectId && subjectId !== 'all') {
    const canonicalId = normalizeSubjectId(subjectId);
    return all.filter((q) => q.subjectId === canonicalId);
  }
  return all;
}
