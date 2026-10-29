export type ExamType = 'JAMB UTME' | 'Post-UTME' | 'WAEC' | 'NECO';

export type ExamMode = 'practice' | 'timed' | 'simulation';

export type AttemptTier = 'free' | 'standard';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  displayOrder: number;
  totalQuestions?: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  active: boolean;
  displayOrder: number;
}

export interface Question {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  passage?: string;
  questionText: string;
  options: string[]; // 4 choices: A, B, C, D
  correctAnswerIndex: number; // 0, 1, 2, 3
  solution?: string;
  difficulty?: QuestionDifficulty;
  year?: number | string;
  examType?: ExamType;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamSessionConfig {
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    questionCount: number;
    yearOrModel: string;
    selectedTopics?: string[]; // empty means all
  }>;
  username: string;
  mode: ExamMode;
  totalTimeSeconds: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface ExamQuestionState {
  originalQuestion: Question;
  displayOptions: string[];
  originalIndicesMap: number[]; // maps display index back to original index
  selectedOptionIndex?: number; // index in displayOptions
  isBookmarked?: boolean;
}

export interface ExamAttempt {
  id: string;
  userId?: string;
  username: string;
  mode: ExamMode;
  subjects: string[];
  subjectNames: string[];
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  percentage: number;
  timeLimitSeconds: number;
  timeUsedSeconds: number;
  startedAt: string;
  submittedAt: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  subjectScores?: Record<string, {
    total: number;
    attempted: number;
    correct: number;
    score: number;
  }>;
  questionResults?: Array<{
    questionId: string;
    subjectId: string;
    subjectName: string;
    passage?: string;
    questionText: string;
    options: string[];
    selectedAnswerIndex?: number;
    correctAnswerIndex: number;
    isCorrect: boolean;
    solution?: string;
  }>;
}

export interface UserReport {
  id?: string;
  questionId: string;
  questionTextSnippet: string;
  subjectName: string;
  category: 'Wrong question' | 'Wrong option' | 'Typographical error' | 'Incorrect answer' | 'Other';
  description: string;
  username: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

export interface ExamSettings {
  defaultDurationSeconds: number;
  defaultQuestionCount: number;
  instructions: string;
  allowCalculator: boolean;
  allowDictionary: boolean;
  allowAudioReadout: boolean;
}

export interface ArticleChapter {
  id?: string;
  chapterNumber: number;
  title: string;
  content: string;
  excerpt?: string;
  readTimeMinutes?: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subjectId: string;
  subjectName: string;
  topicName: string;
  excerpt: string;
  content: string; // Full content or fallback
  chapters?: ArticleChapter[]; // Chapter-by-chapter progression
  author: string;
  readTimeMinutes: number;
  keywords: string[];
  datePublished: string;
  updatedDate: string;
}

export interface SubjectCurriculum {
  subjectId: string;
  subjectName: string;
  code: string;
  description: string;
  objectives: string[];
  topicsOverview: Array<{
    title: string;
    description: string;
    subtopics: string[];
  }>;
  recommendedTexts: string[];
  examFormat: {
    questionCount: number;
    timeAllocationMinutes: number;
    markPerQuestion: number;
    keySections: string[];
  };
}

