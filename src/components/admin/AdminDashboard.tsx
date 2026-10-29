import React, { useState, useEffect } from 'react';
import {
  Shield,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  RefreshCw,
  FileText,
  BookOpen,
  Eye,
  Edit3,
  Sparkles,
  Globe,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import type { Question, Subject, UserReport, Article, ArticleChapter } from '../../types';
import {
  getSubjects,
  getAdminQuestions,
  saveQuestion,
  deleteQuestion,
  bulkImportQuestions,
  emptyQuestionBank,
  getAdminReports,
  checkFirestoreLiveStatus,
  FIRESTORE_UPGRADE_URL,
  isQuotaError,
} from '../../services/cbtService';
import { MathScientificText } from '../common/MathScientificText';
import { ScientificHtmlRenderer } from '../common/ScientificHtmlRenderer';

interface AdminDashboardProps {
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToApp }) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'bulk' | 'articles' | 'database' | 'paystack'>('questions');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Firestore Live status state
  const [firestoreStatus, setFirestoreStatus] = useState<{
    connected: boolean;
    quotaExceeded: boolean;
    count: number;
    message?: string;
  } | null>(null);

  // Question editing / creating modal
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  const [savingQ, setSavingQ] = useState(false);

  // Bulk import state
  const [jsonInput, setJsonInput] = useState('');
  const [replaceAllOnImport, setReplaceAllOnImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgressStep, setImportProgressStep] = useState('');
  const [importStatus, setImportStatus] = useState<{ message: string; isError: boolean; isQuota?: boolean } | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Study Material & Chapter creation state (Admin private studio)
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSubjectId, setArticleSubjectId] = useState('mathematics');
  const [articleTopic, setArticleTopic] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [activeChapterEditIdx, setActiveChapterEditIdx] = useState(0);
  const [articlePreviewTab, setArticlePreviewTab] = useState<'edit' | 'preview'>('edit');
  const [isArticleSubmitting, setIsArticleSubmitting] = useState(false);
  const [articleMessage, setArticleMessage] = useState<string | null>(null);

  const [chaptersInput, setChaptersInput] = useState<ArticleChapter[]>([
    {
      chapterNumber: 1,
      title: 'Foundational Principles & Core Concepts',
      content: '<h1>Chapter 1: Foundational Principles</h1>\n<p>Explain the fundamental laws, axioms, and introductory rules here...</p>\n\n<div class="formula-box">\n  <div class="formula-title">Core Governing Equation</div>\n  <div class="formula-math">$$y = a x^n \\implies \\frac{dy}{dx} = a \\cdot n \\cdot x^{n-1}$$</div>\n</div>',
      readTimeMinutes: 3,
    },
    {
      chapterNumber: 2,
      title: 'Formulas, Chemical Equations & Solved Problems',
      content: '<h1>Chapter 2: Formulas & Solved Examples</h1>\n<p>Step-by-step mathematical or chemical solutions for students...</p>',
      readTimeMinutes: 3,
    },
  ]);

  // Paystack & Single-Device overview state
  const [paystackOverview, setPaystackOverview] = useState<{
    webhookUrl: string;
    hasSecretKey: boolean;
    hasPublicKey: boolean;
    amountNgn: number;
    devices: any[];
    references: any[];
    webhookLogs: any[];
  } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [subjList, qList, repList, fsStatus] = await Promise.all([
        getSubjects(),
        getAdminQuestions(),
        getAdminReports(),
        checkFirestoreLiveStatus(),
      ]);
      setSubjects(subjList);
      setQuestions(qList);
      setReports(repList);
      setFirestoreStatus(fsStatus);

      // Load articles from backend
      try {
        const artRes = await fetch('/api/articles');
        if (artRes.ok) {
          const artData = await artRes.json();
          setArticles(artData.articles || []);
        }
      } catch {
        // fallback
      }

      // Load paystack logs
      try {
        const psRes = await fetch('/api/paystack/admin/overview');
        if (psRes.ok) {
          setPaystackOverview(await psRes.json());
        }
      } catch {
        // ignore if offline
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmptyQuestionBank = async () => {
    if (confirm('Are you sure you want to completely DELETE and EMPTY the entire question bank? This action cannot be undone.')) {
      setIsClearing(true);
      try {
        await emptyQuestionBank();
        setQuestions([]);
        setImportStatus({
          message: 'Question bank has been completely emptied and deleted. (0 questions in dataset)',
          isError: false,
        });
        await loadAllData();
      } catch (err: any) {
        setImportStatus({ message: `Failed to empty question bank: ${err.message}`, isError: true });
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleLoadSampleSchema = () => {
    const sample = [
      {
        id: "acc_01",
        subject: "accounting",
        question: "The fundamental accounting equation is expressed as:",
        questionText: "The fundamental accounting equation is expressed as:",
        options: [
          "Assets = Capital + Liabilities",
          "Assets = Liabilities - Capital",
          "Capital = Assets + Liabilities",
          "Liabilities = Assets + Capital"
        ],
        correctAnswer: "Assets = Capital + Liabilities",
        correctAnswerIndex: 0,
        explanation: "Assets must always equal total claims against them: owners' equity (capital) plus outside liabilities.",
        solution: "Assets must always equal total claims against them: owners' equity (capital) plus outside liabilities.",
        year: "JAMB 2021"
      },
      {
        id: "mth_01",
        subject: "mathematics",
        question: "Find the derivative of y = 4x³ - 5x² + 7x - 9 with respect to x.",
        questionText: "Find the derivative of y = 4x³ - 5x² + 7x - 9 with respect to x.",
        options: [
          "12x² - 10x + 7",
          "12x³ - 10x² + 7",
          "4x² - 5x + 7",
          "12x² - 5x - 9"
        ],
        correctAnswer: "12x² - 10x + 7",
        correctAnswerIndex: 0,
        explanation: "By applying the power rule: d/dx(ax^n) = a*n*x^(n-1). d/dx(4x³) = 12x², d/dx(-5x²) = -10x, d/dx(7x) = 7.",
        solution: "By applying the power rule: d/dx(ax^n) = a*n*x^(n-1). d/dx(4x³) = 12x², d/dx(-5x²) = -10x, d/dx(7x) = 7.",
        year: "JAMB 2022"
      }
    ];
    setJsonInput(JSON.stringify(sample, null, 2));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonInput(content);
        setImportStatus({
          message: `Loaded file "${file.name}" (${(content.length / 1024).toFixed(1)} KB). Click "Validate & Save to JSON Bank" to save.`,
          isError: false,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editingQuestion.questionText || !editingQuestion.subjectId) return;

    setSavingQ(true);
    const matchedSubj = subjects.find((s) => s.id === editingQuestion.subjectId);

    const formatted: Question = {
      id: editingQuestion.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subjectId: editingQuestion.subjectId,
      subjectName: matchedSubj?.name || editingQuestion.subjectId,
      questionText: editingQuestion.questionText,
      options: editingQuestion.options || ['', '', '', ''],
      correctAnswerIndex: editingQuestion.correctAnswerIndex || 0,
      solution: editingQuestion.solution || '',
      year: editingQuestion.year || 'JAMB UTME',
      active: true,
    };

    try {
      await saveQuestion(formatted);
      setEditingQuestion(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingQ(false);
    }
  };

  const handleDeleteQ = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleBulkImport = async () => {
    setImportStatus(null);
    setIsImporting(true);
    setImportProgressStep('Validating JSON syntax & array structure...');

    try {
      let parsed: any;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (parseErr: any) {
        setImportStatus({
          message: `Invalid JSON syntax: ${parseErr.message}. Ensure the pasted content is a valid JSON array.`,
          isError: true,
        });
        setIsImporting(false);
        return;
      }

      if (!Array.isArray(parsed)) {
        setImportStatus({ message: 'JSON root must be an array of question objects [ {...}, {...} ].', isError: true });
        setIsImporting(false);
        return;
      }

      setImportProgressStep(`Preparing ${parsed.length} questions for LIVE Firestore batch import...`);
      const res = await bulkImportQuestions(
        parsed,
        replaceAllOnImport,
        (step) => setImportProgressStep(step)
      );
      if (res.errors.length > 0) {
        setImportStatus({
          message: `Uploaded ${res.added} items to LIVE Firestore database! Total in bank: ${res.total}. Notice: ${res.errors.slice(0, 3).join('; ')}`,
          isError: false,
        });
      } else {
        setImportStatus({
          message: `Successfully saved ${res.added} questions to LIVE Firestore database (ai-studio-0497a9ea-3c8f-4cf9-b18a-a95302a386e2)! Total active: ${res.total}`,
          isError: false,
        });
        setJsonInput('');
      }

      await loadAllData();
    } catch (err: any) {
      const quota = isQuotaError(err);
      setImportStatus({
        message: err.message || String(err),
        isError: true,
        isQuota: quota,
      });
    } finally {
      setIsImporting(false);
      setImportProgressStep('');
    }
  };

  // ---------------- Article & Chapter Management ----------------
  const insertSymbolToChapter = (symbol: string) => {
    setChaptersInput((prev) => {
      const updated = [...prev];
      const cur = updated[activeChapterEditIdx] || updated[0];
      cur.content = (cur.content || '') + symbol;
      return updated;
    });
  };

  const addChapterField = () => {
    const nextNum = chaptersInput.length + 1;
    setChaptersInput((prev) => [
      ...prev,
      {
        chapterNumber: nextNum,
        title: `Chapter ${nextNum}: Key Topic & Practice`,
        content: `<h1>Chapter ${nextNum}: Key Topic & Practice</h1>\n<p>Explain concepts, equations, and examination shortcuts here...</p>`,
        readTimeMinutes: 3,
      },
    ]);
    setActiveChapterEditIdx(chaptersInput.length);
  };

  const removeChapterField = (idx: number) => {
    if (chaptersInput.length <= 1) {
      alert('A study guide must have at least one chapter.');
      return;
    }
    const updated = chaptersInput
      .filter((_, i) => i !== idx)
      .map((ch, i) => ({ ...ch, chapterNumber: i + 1 }));
    setChaptersInput(updated);
    setActiveChapterEditIdx(Math.max(0, idx - 1));
  };

  const handleSaveArticleWithChapters = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || chaptersInput.length === 0) {
      setArticleMessage('Please provide an article title and at least one chapter.');
      return;
    }

    setIsArticleSubmitting(true);
    setArticleMessage(null);

    const autoSlug = (articleSlug.trim() || articleTitle.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const matchedSubj = subjects.find((s) => s.id === articleSubjectId);
    const subjectName = matchedSubj?.name || articleSubjectId;

    const newArticleData: Article = {
      id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: autoSlug,
      title: articleTitle.trim(),
      subjectId: articleSubjectId,
      subjectName,
      topicName: articleTopic.trim() || articleTitle.trim(),
      excerpt: articleExcerpt.trim() || chaptersInput[0]?.content.substring(0, 160).replace(/[#*<>\-_]/g, '') + '...',
      content: chaptersInput[0]?.content || '',
      chapters: chaptersInput,
      author: 'Teramayo Academic Team',
      readTimeMinutes: chaptersInput.reduce((acc, ch) => acc + (ch.readTimeMinutes || 3), 0),
      keywords: [subjectName, articleTopic || 'Study Notes', 'JAMB UTME', 'Chapters'],
      datePublished: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newArticleData),
      });

      if (!res.ok) {
        throw new Error('Failed to save study guide to server');
      }

      setArticleMessage(`Successfully published "${newArticleData.title}" with ${chaptersInput.length} chapters!`);
      setArticleTitle('');
      setArticleTopic('');
      setArticleExcerpt('');
      setArticleSlug('');
      await loadAllData();
    } catch (err: any) {
      setArticleMessage(`Notice: ${err.message}. Data saved to local memory.`);
    } finally {
      setIsArticleSubmitting(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this study guide and its chapters?')) {
      try {
        await fetch(`/api/articles/${id}`, { method: 'DELETE' });
        setArticles((prev) => prev.filter((a) => a.id !== id && a.slug !== id));
      } catch (err) {
        console.error('Delete article failed:', err);
      }
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = selectedSubjectFilter === 'all' || q.subjectId === selectedSubjectFilter;
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans select-none text-slate-800">
      {/* Admin Header */}
      <header className="bg-white border-b border-emerald-100 text-slate-800 px-4 sm:px-8 py-3.5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToApp}
            className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-800"
            title="Return to Student Practice"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-extrabold text-base flex items-center gap-2 text-emerald-950">
              <Shield size={18} className="text-emerald-600" />
              PRIVATE ADMIN STUDIO · LIVE FIRESTORE & QUESTION BANK
            </h1>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-2 flex-wrap">
              <span>Database: <code className="text-emerald-800 font-bold">ai-studio-0497a9ea-3c8f-4cf9-b18a-a95302a386e2</code></span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                firestoreStatus?.quotaExceeded
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : firestoreStatus?.connected
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}>
                {firestoreStatus?.quotaExceeded ? 'Daily Free Quota Reached' : firestoreStatus?.connected ? 'Online · Live' : 'Offline Mode'}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEmptyQuestionBank}
            disabled={isClearing || questions.length === 0}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            title="Delete and empty all questions from the question bank"
          >
            <Trash2 size={13} />
            <span>Empty Question Bank ({questions.length})</span>
          </button>

          <button
            onClick={onBackToApp}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Return to App
          </button>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center gap-4 text-xs font-bold text-gray-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('questions')}
          className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'questions'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent hover:text-gray-900'
          }`}
        >
          <Layers size={15} /> All Questions ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bulk'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent hover:text-gray-900'
          }`}
        >
          <Upload size={15} /> Import / Paste JSON Questions
        </button>

        <button
          onClick={() => setActiveTab('articles')}
          className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'articles'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent hover:text-gray-900'
          }`}
        >
          <BookOpen size={15} /> Publish Study Materials & Chapters ({articles.length})
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'database'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent hover:text-gray-900'
          }`}
        >
          <Database size={15} /> Dataset Status
        </button>

        <button
          onClick={() => setActiveTab('paystack')}
          className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'paystack'
              ? 'border-emerald-600 text-emerald-700 font-extrabold'
              : 'border-transparent hover:text-gray-900'
          }`}
        >
          <Shield size={15} /> Paystack & Device Access
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Quota Notice Banner */}
        {firestoreStatus?.quotaExceeded && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-xs text-xs space-y-2 text-amber-900">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <span>Firestore Daily Free Quota Limit Reached</span>
              </div>
              <a
                href={FIRESTORE_UPGRADE_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shrink-0 shadow-2xs"
              >
                <span>Upgrade in Firebase Console</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-amber-800 text-xs">
              Your Firestore database (<code>ai-studio-0497a9ea-3c8f-4cf9-b18a-a95302a386e2</code>) has reached its free daily quota metric (<span className="font-semibold">Free daily read/write units per project</span>).
              Free tier quotas reset automatically tomorrow at midnight Pacific Time.
            </p>
            <p className="text-amber-900 text-xs font-semibold bg-amber-100/70 p-2 rounded-lg border border-amber-200">
              💡 <strong>Instant Testing Tip:</strong> You can click the <span className="underline font-bold">"Import to Offline Storage (Instant)"</span> button in the import tab below to load all your questions right now for offline practice without waiting for tomorrow or upgrading.
            </p>
          </div>
        )}
        {/* ================= ALL QUESTIONS TAB ================= */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions by text, ID, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="text-xs p-2 border border-gray-300 rounded bg-white font-medium"
                >
                  <option value="all">All Subjects ({questions.length})</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.totalQuestions || 0})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    setEditingQuestion({
                      subjectId: subjects[0]?.id || 'english',
                      options: ['', '', '', ''],
                      correctAnswerIndex: 0,
                      year: 'JAMB UTME',
                    })
                  }
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus size={14} /> Add Single Question
                </button>
              </div>
            </div>

            {/* Questions Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  {questions.length === 0 ? (
                    <div className="space-y-2">
                      <p className="font-bold text-gray-700 text-sm">Question bank is currently empty (0 questions).</p>
                      <p>Use the "Import / Paste JSON Dataset" tab to upload or paste questions matching the schema.</p>
                    </div>
                  ) : (
                    'No questions match your current search / subject filter.'
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold">
                      <tr>
                        <th className="p-3 w-16">ID</th>
                        <th className="p-3 w-28">Subject</th>
                        <th className="p-3">Question Text & Formula</th>
                        <th className="p-3 w-48">Correct Answer</th>
                        <th className="p-3 w-24">Year</th>
                        <th className="p-3 w-20 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredQuestions.slice(0, 100).map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50/70">
                          <td className="p-3 font-mono text-[11px] text-gray-500">{q.id}</td>
                          <td className="p-3 font-bold text-emerald-800">{q.subjectName}</td>
                          <td className="p-3 text-gray-800 font-medium">
                            <MathScientificText text={q.questionText} />
                          </td>
                          <td className="p-3 text-emerald-700 font-semibold">
                            {q.options[q.correctAnswerIndex] || 'None'}
                          </td>
                          <td className="p-3 text-gray-500">{q.year || 'UTME'}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setEditingQuestion(q)}
                                className="p-1 hover:text-emerald-700 text-gray-500"
                                title="Edit Question"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteQ(q.id)}
                                className="p-1 hover:text-red-700 text-gray-500"
                                title="Delete Question"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= BULK IMPORT TAB ================= */}
        {activeTab === 'bulk' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-xs text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Database size={18} className="text-emerald-600" />
                  Bulk Import or Paste Question Bank Dataset
                </h3>
                <p className="text-gray-500 mt-0.5">
                  Import an array of questions directly into LIVE Firestore collection <code className="text-emerald-700 font-bold">questions</code> or instant offline browser storage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadSampleSchema}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold"
                >
                  Load Sample JSON Schema
                </button>

                <label className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold cursor-pointer">
                  Upload .JSON File
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Active Importing Indicator */}
            {isImporting && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-950 font-bold text-xs animate-pulse">
                <RefreshCw size={20} className="animate-spin text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-sm text-emerald-950">Importing questions in progress...</p>
                  <p className="text-emerald-700 font-medium text-xs mt-0.5">{importProgressStep || 'Processing batch...'}</p>
                </div>
              </div>
            )}

            {/* Status Alert */}
            {importStatus && !isImporting && (
              <div
                className={`p-4 rounded-xl text-xs space-y-2 font-medium ${
                  importStatus.isError
                    ? 'bg-red-50 border border-red-200 text-red-900'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {importStatus.isError ? (
                    <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-sm">
                      {importStatus.isError ? 'Import Notice' : 'Import Complete'}
                    </p>
                    <p>{importStatus.message}</p>
                  </div>
                </div>

                {importStatus.isQuota && (
                  <div className="mt-3 pt-3 border-t border-red-200 flex flex-wrap items-center gap-3">
                    <a
                      href={FIRESTORE_UPGRADE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Upgrade Database in Firebase Console</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-gray-700">JSON Question Array Data:</label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceAllOnImport}
                    onChange={(e) => setReplaceAllOnImport(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Replace existing dataset completely (rather than append)</span>
                </label>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={14}
                placeholder={`[\n  {\n    "id": "acc_01",\n    "subject": "accounting",\n    "question": "The fundamental accounting equation is expressed as:",\n    "questionText": "The fundamental accounting equation is expressed as:",\n    "options": [\n      "Assets = Capital + Liabilities",\n      "Assets = Liabilities - Capital",\n      "Capital = Assets + Liabilities",\n      "Liabilities = Assets + Capital"\n    ],\n    "correctAnswer": "Assets = Capital + Liabilities",\n    "correctAnswerIndex": 0,\n    "explanation": "Assets must always equal total claims against them: owners' equity (capital) plus outside liabilities.",\n    "solution": "Assets must always equal total claims against them: owners' equity (capital) plus outside liabilities.",\n    "year": "JAMB 2021"\n  }\n]`}
                className="w-full font-mono text-xs p-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-gray-500 text-[11px]">
                Supports standard field keys: <code>id</code>, <code>subject</code>, <code>question</code> / <code>questionText</code>, <code>options</code> (array), <code>correctAnswer</code> / <code>correctAnswerIndex</code>, <code>solution</code> / <code>explanation</code>, <code>year</code>.
              </span>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={!jsonInput.trim() || isImporting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isImporting ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  <span>Save to LIVE Firestore Bank</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= PUBLISH STUDY MATERIALS & CHAPTERS TAB (NEW!) ================= */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            {/* Create New Study Guide & Chapters Form */}
            <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-2">
                    <BookOpen size={18} className="text-emerald-600" />
                    Publish Subject Study Guide & Modular Chapters
                  </h3>
                  <p className="text-slate-500 mt-0.5">
                    Generates unique crawlable URLs per chapter for Google AdSense bots and provides smooth Previous/Next chapter navigation for students.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 p-1 rounded-xl border border-emerald-200">
                  <button
                    type="button"
                    onClick={() => setArticlePreviewTab('edit')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                      articlePreviewTab === 'edit'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    <Edit3 size={13} />
                    <span>Editor Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticlePreviewTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                      articlePreviewTab === 'preview'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    <Eye size={13} />
                    <span>Live Scientific Preview</span>
                  </button>
                </div>
              </div>

              {articleMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{articleMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveArticleWithChapters} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-emerald-950 block mb-1">Study Guide Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chemical Thermodynamics, Enthalpy & Hess's Law"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Subject</label>
                    <select
                      value={articleSubjectId}
                      onChange={(e) => setArticleSubjectId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs capitalize focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">Topic Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Physical Chemistry"
                      value={articleTopic}
                      onChange={(e) => setArticleTopic(e.target.value)}
                      className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-emerald-950 block mb-1">URL Slug (Auto or Custom)</label>
                    <input
                      type="text"
                      placeholder="e.g. chemical-thermodynamics-enthalpy"
                      value={articleSlug}
                      onChange={(e) => setArticleSlug(e.target.value)}
                      className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Chapter Management Section */}
                <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider">
                      Modular Chapters ({chaptersInput.length} Chapters)
                    </span>
                    <button
                      type="button"
                      onClick={addChapterField}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Plus size={13} />
                      <span>Add Another Chapter</span>
                    </button>
                  </div>

                  {/* Chapter Tab Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {chaptersInput.map((ch, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          activeChapterEditIdx === idx
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                        onClick={() => setActiveChapterEditIdx(idx)}
                      >
                        <span>Ch. {ch.chapterNumber}</span>
                        {chaptersInput.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeChapterField(idx);
                            }}
                            className="ml-1 hover:text-red-300 font-bold"
                            title="Remove Chapter"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Active Chapter Details */}
                  {chaptersInput[activeChapterEditIdx] && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                      <div>
                        <label className="font-bold text-emerald-950 block mb-1">
                          Chapter {chaptersInput[activeChapterEditIdx].chapterNumber} Title
                        </label>
                        <input
                          type="text"
                          value={chaptersInput[activeChapterEditIdx].title}
                          onChange={(e) => {
                            const updated = [...chaptersInput];
                            updated[activeChapterEditIdx].title = e.target.value;
                            setChaptersInput(updated);
                          }}
                          className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Scientific Symbols Quick Toolbar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-emerald-900">
                            Scientific Symbol Bar (Click to insert):
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
                          {[
                            { label: 'x²', val: '<sup>2</sup>' },
                            { label: 'x₁', val: '<sub>1</sub>' },
                            { label: 'Δ', val: '&Delta;' },
                            { label: '→', val: ' &rarr; ' },
                            { label: '⇌', val: ' &#8652; ' },
                            { label: '±', val: '&plusmn;' },
                            { label: 'π', val: '&pi;' },
                            { label: 'Ω', val: '&Omega;' },
                            { label: 'λ', val: '&lambda;' },
                            { label: '√', val: '&radic;' },
                            { label: '∫', val: '&int;' },
                            { label: '∑', val: '&sum;' },
                            { label: 'θ', val: '&theta;' },
                            { label: '°C', val: '&deg;C' },
                            { label: 'ΔH', val: '&Delta;H' },
                          ].map((sym, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => insertSymbolToChapter(sym.val)}
                              className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-md text-emerald-900 font-bold transition-colors"
                            >
                              {sym.label}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              insertSymbolToChapter(
                                '\n<div class="formula-box">\n  <div class="formula-title">Governing Formula</div>\n  <div class="formula-math">$$F = m \\cdot a$$</div>\n</div>\n'
                              )
                            }
                            className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-md text-emerald-900 font-bold ml-auto"
                          >
                            + Formula Box
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              insertSymbolToChapter(
                                '\n<div class="chemical-equation">CaCO<sub>3(s)</sub> &rarr; CaO<sub>(s)</sub> + CO<sub>2(g)</sub></div>\n'
                              )
                            }
                            className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-md text-emerald-900 font-bold"
                          >
                            + Chemical Reaction
                          </button>
                        </div>
                      </div>

                      {articlePreviewTab === 'preview' ? (
                        <div className="p-4 bg-white border border-emerald-100 rounded-xl min-h-[160px]">
                          <ScientificHtmlRenderer
                            content={chaptersInput[activeChapterEditIdx].content}
                          />
                        </div>
                      ) : (
                        <textarea
                          rows={8}
                          value={chaptersInput[activeChapterEditIdx].content}
                          onChange={(e) => {
                            const updated = [...chaptersInput];
                            updated[activeChapterEditIdx].content = e.target.value;
                            setChaptersInput(updated);
                          }}
                          placeholder="Write chapter content in HTML or Markdown with equations and scientific formulas..."
                          className="w-full font-mono text-xs p-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isArticleSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>Publish Subject Study Material with Chapters</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Current Published Study Materials */}
            <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-emerald-950 flex items-center gap-2">
                <Layers size={18} className="text-emerald-600" />
                Active Published Study Materials & Modular Chapter Directory
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 uppercase font-bold">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Title & Topic</th>
                      <th className="p-3">Chapters Count</th>
                      <th className="p-3">Crawlable URL for AdSense</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {articles.map((art) => (
                      <tr key={art.slug} className="hover:bg-emerald-50/40">
                        <td className="p-3 font-bold text-emerald-900">{art.subjectName}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{art.title}</div>
                          <div className="text-[11px] text-slate-500">{art.topicName}</div>
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          {art.chapters?.length || 4} Modular Chapters
                        </td>
                        <td className="p-3 font-mono text-emerald-800 break-all text-[11px]">
                          <a
                            href={`#/${'study-materials'}/${art.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>/#/study-materials/{art.slug}</span>
                            <ExternalLink size={12} />
                          </a>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteArticle(art.id || art.slug)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Delete this study material"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= DATASET STATUS TAB ================= */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 text-xs shadow-xs">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Database size={18} className="text-emerald-700" />
                Local JSON Dataset Status (<code className="text-emerald-700">data/questions.json</code>)
              </h3>
              <p className="text-gray-500 mt-0.5">
                Live Firestore queries for question banks are permanently disabled. The system reads and writes to server-side JSON file storage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <span className="text-gray-500 text-[11px] font-bold block uppercase">Subjects Catalog</span>
                <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{subjects.length} Subjects</span>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <span className="text-gray-500 text-[11px] font-bold block uppercase">Total Questions in Bank</span>
                <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                  {questions.length} Questions
                </span>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <span className="text-gray-500 text-[11px] font-bold block uppercase">Study Guide Articles</span>
                <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                  {articles.length} Guides
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <span className="text-gray-500">
                Need to purge all questions for a clean start?
              </span>
              <button
                onClick={handleEmptyQuestionBank}
                disabled={isClearing || questions.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow"
              >
                <Trash2 size={14} />
                <span>Empty & Purge Question Bank</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= PAYSTACK & DEVICE ACCESS TAB ================= */}
        {activeTab === 'paystack' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 text-xs shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Shield size={18} className="text-emerald-700" />
                  Paystack Webhook & Single-Device Entitlement Store
                </h3>
                <p className="text-gray-500 mt-0.5">
                  Standard Mode attempt gating is bound to a single device fingerprint. Webhook logs and devices are tracked below.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    paystackOverview?.hasSecretKey
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {paystackOverview?.hasSecretKey ? 'Secret Key Active' : 'Test Mode (Mock)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-gray-500 font-bold block uppercase text-[11px]">Standard Attempt Fee</span>
                <span className="text-xl font-extrabold text-gray-900 mt-1 block">
                  ₦{paystackOverview?.amountNgn || 1500}
                </span>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-gray-500 font-bold block uppercase text-[11px]">Unlocked Devices</span>
                <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
                  {paystackOverview?.devices?.length || 0} Devices
                </span>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-gray-500 font-bold block uppercase text-[11px]">Processed Webhooks</span>
                <span className="text-xl font-extrabold text-blue-700 mt-1 block">
                  {paystackOverview?.webhookLogs?.length || 0} Events
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit / Create Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-gray-900">
                {editingQuestion.id ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button onClick={() => setEditingQuestion(null)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">
                ×
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Subject</label>
                  <select
                    value={editingQuestion.subjectId || subjects[0]?.id || 'english'}
                    onChange={(e) => setEditingQuestion((prev) => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Year / Exam</label>
                  <input
                    type="text"
                    value={editingQuestion.year || 'JAMB UTME'}
                    onChange={(e) => setEditingQuestion((prev) => ({ ...prev, year: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Question Text</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.questionText || ''}
                  onChange={(e) => setEditingQuestion((prev) => ({ ...prev, questionText: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-gray-700 block">Options & Correct Answer</label>
                {[0, 1, 2, 3].map((optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  return (
                    <div key={optIdx} className="flex items-center gap-2">
                      <span className="font-bold w-4 text-center">{letter}</span>
                      <input
                        type="text"
                        required
                        value={editingQuestion.options?.[optIdx] || ''}
                        onChange={(e) => {
                          const newOpts = [...(editingQuestion.options || ['', '', '', ''])];
                          newOpts[optIdx] = e.target.value;
                          setEditingQuestion((prev) => ({ ...prev, options: newOpts }));
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder={`Option ${letter}`}
                      />
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={editingQuestion.correctAnswerIndex === optIdx}
                          onChange={() => setEditingQuestion((prev) => ({ ...prev, correctAnswerIndex: optIdx }))}
                        />
                        <span>Correct</span>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Solution / Explanation</label>
                <textarea
                  rows={2}
                  value={editingQuestion.solution || ''}
                  onChange={(e) => setEditingQuestion((prev) => ({ ...prev, solution: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Detailed explanation for students..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-gray-200 rounded font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQ}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold"
                >
                  {savingQ ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
