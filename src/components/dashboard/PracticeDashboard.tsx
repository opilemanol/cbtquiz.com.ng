import React, { useState, useEffect } from 'react';
import {
  Home,
  Check,
  Layers,
  Info,
  Clock,
  History,
  ShieldCheck,
  Loader2,
  AlertCircle,
  BookOpen,
  Keyboard,
  HelpCircle,
  GraduationCap,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Subject, Topic, ExamMode, ExamSessionConfig, AttemptTier } from '../../types';
import { getSubjects, getTopics } from '../../services/cbtService';
import {
  getQuestionCountForTier,
  getDeviceIdentity,
  type DeviceAccessStatus
} from '../../services/paymentService';
import { InstructionsModal } from '../cbt/InstructionsModal';
import { TopicSelectorModal } from './TopicSelectorModal';
import { QuizStudyMaterialsCompanion } from '../study/QuizStudyMaterialsCompanion';

interface PracticeDashboardProps {
  onStartExam: (config: ExamSessionConfig) => Promise<void>;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  initialUsername?: string;
}

export const PracticeDashboard: React.FC<PracticeDashboardProps> = ({
  onStartExam,
  onOpenHistory,
  onOpenAdmin,
  initialUsername = '',
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingExam, setStartingExam] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected subjects state: maps subjectId to config (Default: 4 core JAMB subjects)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([
    'english',
    'mathematics',
    'physics',
    'chemistry',
  ]);

  // Default to 'standard' (Full JAMB Attempt: 60 English / 40 Others, 100% Free & Ungated)
  const [attemptTier, setAttemptTier] = useState<AttemptTier>('standard');

  // FAQ Accordion State for SEO
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Per-subject config: question count, year/model exam, selected topics
  const [subjectConfigs, setSubjectConfigs] = useState<
    Record<
      string,
      {
        questionCount: number;
        yearOrModel: string;
        selectedTopics: string[];
      }
    >
  >({
    english: { questionCount: 60, yearOrModel: 'Model Exam 1', selectedTopics: [] },
    mathematics: { questionCount: 40, yearOrModel: 'Model Exam 1', selectedTopics: [] },
    physics: { questionCount: 40, yearOrModel: 'Model Exam 1', selectedTopics: [] },
    chemistry: { questionCount: 40, yearOrModel: 'Model Exam 1', selectedTopics: [] },
    biology: { questionCount: 40, yearOrModel: 'Model Exam 1', selectedTopics: [] },
    life_changer: { questionCount: 50, yearOrModel: '2027 Compulsory Novel', selectedTopics: [] },
  });

  // Active subject selected for detail editing in the left panel
  const [activeSubjectCardId, setActiveSubjectCardId] = useState<string>('english');

  // Candidate username
  const [username, setUsername] = useState<string>(initialUsername || 'PROSPER');

  // Examination Mode
  const [mode, setMode] = useState<ExamMode>('practice');

  // Total examination time (default: 2 hours)
  const [totalTimeInput, setTotalTimeInput] = useState<string>('02:00:00');

  // Shuffle options
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);

  // Modals
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [topicModalSubjectId, setTopicModalSubjectId] = useState<string | null>(null);
  const [currentTopics, setCurrentTopics] = useState<Topic[]>([]);

  // Load subjects on mount
  useEffect(() => {
    async function loadData() {
      try {
        const list = await getSubjects();
        setSubjects(list);
      } catch (err) {
        console.error('Failed to load initial dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Ensure activeSubjectCardId exists in subjectConfigs
  useEffect(() => {
    if (!subjectConfigs[activeSubjectCardId]) {
      setSubjectConfigs((prev) => ({
        ...prev,
        [activeSubjectCardId]: {
          questionCount: activeSubjectCardId === 'english' ? 60 : 40,
          yearOrModel: 'Model Exam 1',
          selectedTopics: [],
        },
      }));
    }
  }, [activeSubjectCardId, subjectConfigs]);

  // Handle changing between Free Drill vs Full Standard JAMB Attempt
  const handleSelectAttemptTier = (targetTier: AttemptTier) => {
    setAttemptTier(targetTier);
    setErrorMessage(null);
  };

  // Handle toggle subject selection checkbox
  const handleToggleSubject = (subjectId: string) => {
    if (selectedSubjectIds.includes(subjectId)) {
      if (selectedSubjectIds.length <= 1) {
        setErrorMessage('Please keep at least one subject selected.');
        return;
      }
      setSelectedSubjectIds((prev) => prev.filter((id) => id !== subjectId));
      if (activeSubjectCardId === subjectId) {
        const remaining = selectedSubjectIds.filter((id) => id !== subjectId);
        if (remaining.length > 0) setActiveSubjectCardId(remaining[0]);
      }
    } else {
      setSelectedSubjectIds((prev) => [...prev, subjectId]);
      setActiveSubjectCardId(subjectId);
      if (!subjectConfigs[subjectId]) {
        setSubjectConfigs((prev) => ({
          ...prev,
          [subjectId]: {
            questionCount: subjectId === 'english' ? 60 : 40,
            yearOrModel: 'Model Exam 1',
            selectedTopics: [],
          },
        }));
      }
    }
    setErrorMessage(null);
  };

  // Open Topic selector modal for a specific subject
  const handleOpenTopics = async (subjectId: string) => {
    setTopicModalSubjectId(subjectId);
    try {
      const topics = await getTopics(subjectId);
      setCurrentTopics(topics);
    } catch {
      setCurrentTopics([]);
    }
  };

  const handleToggleTopic = (topicId: string) => {
    if (!topicModalSubjectId) return;
    setSubjectConfigs((prev) => {
      const current = prev[topicModalSubjectId] || {
        yearOrModel: 'Model Exam 1',
        selectedTopics: [],
      };
      const exists = current.selectedTopics.includes(topicId);
      const updated = exists
        ? current.selectedTopics.filter((id) => id !== topicId)
        : [...current.selectedTopics, topicId];

      return {
        ...prev,
        [topicModalSubjectId]: {
          ...current,
          selectedTopics: updated,
        },
      };
    });
  };

  const handleSelectAllTopics = () => {
    if (!topicModalSubjectId) return;
    setSubjectConfigs((prev) => ({
      ...prev,
      [topicModalSubjectId]: {
        ...prev[topicModalSubjectId],
        selectedTopics: currentTopics.map((t) => t.id),
      },
    }));
  };

  const handleClearAllTopics = () => {
    if (!topicModalSubjectId) return;
    setSubjectConfigs((prev) => ({
      ...prev,
      [topicModalSubjectId]: {
        ...prev[topicModalSubjectId],
        selectedTopics: [],
      },
    }));
  };

  // Parse total time HH:MM:SS to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map((p) => parseInt(p.trim(), 10) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 7200; // default 2 hours
  };

  // Launch Examination (100% Free & Ungated)
  const handleGetStarted = async () => {
    if (selectedSubjectIds.length === 0) {
      setErrorMessage('Please select at least one subject to begin practice.');
      return;
    }

    if (!username.trim()) {
      setErrorMessage('Please enter your candidate username.');
      return;
    }

    setErrorMessage(null);
    setStartingExam(true);

    const configs = selectedSubjectIds.map((sId) => {
      const subj = subjects.find((s) => s.id === sId);
      const conf = subjectConfigs[sId] || {
        questionCount: sId === 'english' ? 60 : 40,
        yearOrModel: 'Model Exam 1',
        selectedTopics: [],
      };
      return {
        subjectId: sId,
        subjectName: subj?.name || sId,
        questionCount: getQuestionCountForTier(sId, attemptTier, conf.questionCount),
        yearOrModel: conf.yearOrModel || 'Model Exam 1',
        selectedTopics: conf.selectedTopics || [],
      };
    });

    const totalSecs = parseTimeToSeconds(totalTimeInput);

    try {
      await onStartExam({
        subjects: configs,
        username: username.trim(),
        mode,
        totalTimeSeconds: totalSecs,
        shuffleQuestions,
        shuffleOptions,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to launch examination. Please try again.');
      setStartingExam(false);
    }
  };

  const activeSubjectData = subjects.find((s) => s.id === activeSubjectCardId);
  const activeSubjectConf = subjectConfigs[activeSubjectCardId] || {
    yearOrModel: 'Model Exam 1',
    selectedTopics: [],
  };

  // Comprehensive FAQ data for AdSense indexability & structured educational value
  const faqs = [
    {
      q: 'How does the UTME CBT scoring and question allocation work?',
      a: 'In the Joint Admissions and Matriculation Board (JAMB) Unified Tertiary Matriculation Examination (UTME), candidates sit for four subjects. Use of English contains 60 questions and is scaled to 100 marks. The other three elective subjects contain 40 questions each and are each scaled to 100 marks, resulting in a total aggregate score of 400 marks. Candidates have 2 hours (120 minutes) to answer all 180 questions.'
    },
    {
      q: 'What is the 8-Key CBT Navigation System used in JAMB exams?',
      a: 'The 8-Key system allows candidates to navigate the entire examination computer workstation using only keyboard shortcuts without needing a mouse. The keys are: A, B, C, D (select option A, B, C, or D), P (navigate to Previous question), N (navigate to Next question), S (Submit exam), and R (Reverse or clear your current choice).'
    },
    {
      q: 'Can I practice individual chapters before taking a full mock examination?',
      a: 'Yes! You can explore our Study Materials section to read in-depth curriculum notes chapter by chapter with full scientific formulas. Each chapter includes an interactive Chapter Practice Drill widget right on the page, and you can also consult the study notes below this CBT test screen.'
    },
    {
      q: 'Are all past questions and standard model exams completely free?',
      a: 'Yes, this platform is completely ungated and 100% free for all students and secondary school candidates. You can take unlimited full standard JAMB simulation exams (60 questions for English, 40 for other subjects) and quick topic drills anytime.'
    },
    {
      q: 'What are the recommended subject combinations for Science, Engineering, and Medicine?',
      a: 'For Medicine and Surgery or Pharmacy: Use of English, Biology, Chemistry, and Physics. For Engineering (Civil, Mechanical, Electrical, Computer): Use of English, Mathematics, Physics, and Chemistry. For Computer Science: Use of English, Mathematics, Physics, and Chemistry (or Biology). For Law: Use of English, Literature in English, Government, and CRS/IRS.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none text-gray-800 relative">
      {/* Background Education Line-Art Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20h20v20H20zM70 30l15-15 15 15-15 15zM30 80a15 15 0 1 0 0-30 15 15 0 0 0 0 30zM80 80h20v20H80z' fill='%23000' fill-rule='evenodd' fill-opacity='0.6'/%3E%3C/svg%3E")`,
        }}
      />

      {/* TOP HEADER */}
      <header className="bg-[#28a745] text-white px-4 sm:px-8 py-2.5 shadow-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck size={16} className="text-green-100" />
          <span className="font-semibold text-[11px] text-green-50 hidden sm:inline">
            100% Free JAMB UTME Simulator · All 4 Subjects Unlocked
          </span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold tracking-wide text-center">
          Practice For UTME
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenHistory}
            className="p-1.5 hover:bg-green-700/60 rounded text-white transition-colors"
            title="View Past Examination Results"
          >
            <History size={18} />
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-1.5 hover:bg-green-700/60 rounded text-white transition-colors"
            title="Home"
          >
            <Home size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6 relative z-10 flex flex-col justify-between">
        {errorMessage && (
          <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-2 rounded text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-red-900 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* SELECT ONE OR MORE SUBJECTS */}
        <section className="bg-white rounded border border-gray-300 p-4 shadow-xs">
          <div className="border-b border-gray-200 pb-2 mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Select One or More Subjects
            </h2>
            <div className="text-xs flex items-center gap-2">
              <span className="text-green-800 font-semibold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                <ShieldCheck size={14} className="text-green-700" />
                Full UTME CBT Access: 100% Free Public Simulator
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6 text-gray-400 text-xs gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading subject catalog...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs">
              {subjects.map((subj) => {
                const isChecked = selectedSubjectIds.includes(subj.id);
                return (
                  <label
                    key={subj.id}
                    onClick={() => handleToggleSubject(subj.id)}
                    className="flex items-center gap-2 cursor-pointer hover:text-green-800 transition-colors select-none py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 accent-green-600 rounded cursor-pointer"
                    />
                    <span
                      className={`truncate ${
                        isChecked ? 'font-bold text-green-900' : 'text-gray-700'
                      }`}
                    >
                      {subj.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </section>

        {/* THREE COLUMNS: [SELECTED SUBJECT CARDS] | [CENTER CANDIDATE] | [RIGHT CONFIG] */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* ---------------- LEFT: SELECTED SUBJECT CARDS (4 cols) ---------------- */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="space-y-2">
              {selectedSubjectIds.map((sId) => {
                const subj = subjects.find((s) => s.id === sId);
                const conf = subjectConfigs[sId] || {
                  yearOrModel: 'Model Exam 1',
                  selectedTopics: [],
                };
                const qCount = getQuestionCountForTier(sId, attemptTier);
                const isActive = sId === activeSubjectCardId;

                return (
                  <div
                    key={sId}
                    onClick={() => setActiveSubjectCardId(sId)}
                    className={`cursor-pointer rounded transition-all text-white p-3 ${
                      isActive
                        ? 'bg-[#28a745] shadow-md border-2 border-green-700'
                        : 'bg-[#2e7d32]/90 hover:bg-[#28a745] border border-green-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span className="flex items-center gap-1.5">
                        {isActive && <Check size={16} />}
                        {subj?.name || sId}
                      </span>
                      <span className="text-[11px] font-normal opacity-95">
                        {attemptTier === 'free'
                          ? '10 Qs (Quick Drill)'
                          : `${qCount} Questions (Full JAMB)`}
                      </span>
                    </div>
                    <div className="text-[11px] text-green-100 flex items-center justify-between mt-1">
                      <span>{conf.yearOrModel}</span>
                      <span>
                        {conf.selectedTopics.length > 0
                          ? `${conf.selectedTopics.length} topics`
                          : 'All Topics'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Subject Configuration Inputs */}
            {activeSubjectData && (
              <div className="bg-white rounded border border-gray-300 p-3.5 space-y-3 shadow-xs text-xs mt-3">
                <div className="font-bold text-gray-800 pb-1 border-b border-gray-200 flex items-center justify-between">
                  <span>Configure: {activeSubjectData.name}</span>
                </div>

                {/* Year / Model Exam dropdown */}
                <div>
                  <label className="text-gray-600 block mb-1 font-semibold">
                    Year / Exam Series
                  </label>
                  <select
                    value={activeSubjectConf.yearOrModel}
                    onChange={(e) =>
                      setSubjectConfigs((prev) => ({
                        ...prev,
                        [activeSubjectCardId]: {
                          ...activeSubjectConf,
                          yearOrModel: e.target.value,
                        },
                      }))
                    }
                    className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-600"
                  >
                    <option value="Model Exam 1">Model Exam 1 (2027 Standard)</option>
                    <option value="Model Exam 2">Model Exam 2</option>
                    <option value="UTME 2026 Past Questions">UTME 2026 Past Questions</option>
                    <option value="UTME 2025 Past Questions">UTME 2025 Past Questions</option>
                    <option value="UTME 2024 Past Questions">UTME 2024 Past Questions</option>
                  </select>
                </div>

                {/* Number of question dropdown — Attempt Tier */}
                <div>
                  <label className="text-gray-600 block mb-1 font-semibold">
                    Practice Mode (Attempt Tier)
                  </label>
                  <select
                    value={attemptTier}
                    onChange={(e) => handleSelectAttemptTier(e.target.value as AttemptTier)}
                    className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-600 font-semibold"
                  >
                    <option value="standard">
                      Full Standard JAMB Exam (60 English / 40 Others - 100% Free)
                    </option>
                    <option value="free">
                      Quick Practice Drill (10 Questions per Subject)
                    </option>
                  </select>
                </div>

                {/* Question count selector per subject */}
                <div>
                  <label className="text-gray-600 block mb-1 font-semibold">
                    Questions for {activeSubjectData.name}:
                  </label>
                  <select
                    value={activeSubjectConf.questionCount || (activeSubjectCardId === 'english' ? 60 : 40)}
                    onChange={(e) =>
                      setSubjectConfigs((prev) => ({
                        ...prev,
                        [activeSubjectCardId]: {
                          ...activeSubjectConf,
                          questionCount: parseInt(e.target.value, 10),
                        },
                      }))
                    }
                    className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-600 font-semibold"
                  >
                    <option value={10}>10 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={30}>30 Questions</option>
                    <option value={40}>40 Questions (UTME Standard)</option>
                    <option value={50}>50 Questions</option>
                    <option value={60}>60 Questions (Use of English Standard)</option>
                    <option value={80}>80 Questions</option>
                    <option value={100}>100 Questions</option>
                  </select>
                </div>

                {/* Topic selection */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5 text-gray-700">
                    <span className="font-semibold">
                      Topic:{' '}
                      <span className="font-normal text-gray-500">
                        {activeSubjectConf.selectedTopics.length > 0
                          ? `${activeSubjectConf.selectedTopics.length} selected`
                          : 'All Topics Included'}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenTopics(activeSubjectCardId)}
                    className="w-full py-1.5 border border-green-600 text-green-800 hover:bg-green-50 rounded font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Layers size={13} />
                    Select Specific Topics
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ---------------- CENTER: CANDIDATE & GET STARTED (4 cols) ---------------- */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center py-4 px-2 space-y-4">
            {/* Green Profile Avatar */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#28a745] flex items-center justify-center text-white shadow-md border-4 border-white">
                <svg
                  className="w-20 h-20 sm:w-24 sm:h-24 fill-white"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="7" r="4.5" />
                  <path d="M12 13c-4.42 0-8 2.24-8 5v1.5h16V18c0-2.76-3.58-5-8-5z" />
                </svg>
              </div>
            </div>

            {/* Candidate Username Input */}
            <div className="w-full max-w-xs space-y-1 text-center">
              <label className="text-xs font-semibold text-gray-700 block">
                Candidate Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter candidate name"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-center text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-inner"
              />
            </div>

            {/* Two-Option Selector Card (Full Exam vs Quick Drill - Both 100% Free) */}
            <div className="w-full max-w-xs bg-white border border-gray-300 rounded p-2.5 space-y-2 text-xs shadow-xs">
              <span className="font-bold text-gray-700 block text-center">
                Select Exam Preset (100% Free)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAttemptTier('standard')}
                  className={`py-2 px-2 rounded border text-center transition-all ${
                    attemptTier === 'standard'
                      ? 'bg-[#1e5622] text-white border-green-900 font-bold shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <div className="text-xs font-bold">Standard Exam</div>
                  <div className="text-[10px] opacity-90">60/40 Qs · Full Mock</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAttemptTier('free')}
                  className={`py-2 px-2 rounded border text-center transition-all ${
                    attemptTier === 'free'
                      ? 'bg-green-700 text-white border-green-800 font-bold shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <div className="text-xs font-bold">Quick Drill</div>
                  <div className="text-[10px] opacity-90">10 Qs / Subject</div>
                </button>
              </div>
            </div>

            {/* Prominent Blue Get Started Button (100% Free & Immediate Launch) */}
            <div className="w-full max-w-xs pt-1">
              <button
                onClick={handleGetStarted}
                disabled={startingExam}
                className="w-full bg-[#1565d8] hover:bg-[#0d47a1] active:scale-95 text-white font-bold text-sm sm:text-base py-3 rounded shadow-md transition-all flex items-center justify-center gap-2"
              >
                {startingExam ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Loading CBT Session...</span>
                  </>
                ) : (
                  <span>
                    Get Started ({attemptTier === 'standard' ? 'Full JAMB Exam' : 'Quick Drill'})
                  </span>
                )}
              </button>
              <div className="text-[11px] text-center text-gray-500 mt-1.5">
                Instant start · No payment required · Complete review
              </div>
            </div>
          </div>

          {/* ---------------- RIGHT: MODE, TIME, OPTIONS, INSTRUCTIONS (4 cols) ---------------- */}
          <div className="lg:col-span-4 bg-white rounded border border-gray-300 p-4 shadow-xs space-y-4 text-xs">
            {/* Mode selection */}
            <div>
              <label className="text-xs font-bold text-gray-800 block mb-1">
                Exam Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as ExamMode)}
                className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-600 font-medium"
              >
                <option value="practice">Practice (Timed with corrections & solutions)</option>
                <option value="timed">Timed Practice (Strict countdown clock)</option>
                <option value="simulation">Exam Simulation (Authentic JAMB rules)</option>
              </select>
              <div className="mt-1.5 p-2 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-600 leading-snug">
                {mode === 'practice' &&
                  'Get timed, view detailed score breakdown, and get step-by-step corrections upon completion.'}
                {mode === 'timed' &&
                  'Strict examination timing. Answers remain sealed until official submission.'}
                {mode === 'simulation' &&
                  'Full official JAMB simulation workstation with locked rules and performance audit.'}
              </div>
            </div>

            {/* Total Time input */}
            <div>
              <label className="text-xs font-bold text-gray-800 block mb-1">
                Examination Duration
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={totalTimeInput}
                  onChange={(e) => setTotalTimeInput(e.target.value)}
                  placeholder="02:00:00"
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs font-mono font-bold text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-green-600"
                />
                <Clock
                  size={14}
                  className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none"
                />
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Format: HH:MM:SS (Standard UTME: 02:00:00)
              </span>
            </div>

            {/* Shuffle Options */}
            <div className="pt-1 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-800 block mb-2">
                Question Randomization
              </label>
              <div className="space-y-1.5 text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-3.5 h-3.5 accent-green-600 rounded cursor-pointer"
                  />
                  <span>Shuffle Questions Order</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="w-3.5 h-3.5 accent-green-600 rounded cursor-pointer"
                  />
                  <span>Shuffle Options (A, B, C, D)</span>
                </label>
              </div>
            </div>

            {/* Instructions */}
            <div className="pt-2 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-800 block mb-1.5">
                Candidate Instructions & Guidelines
              </label>
              <button
                onClick={() => setIsInstructionsOpen(true)}
                className="w-full py-2 bg-[#28a745] hover:bg-[#218838] active:scale-95 text-white font-bold text-xs rounded transition-colors shadow flex items-center justify-center gap-1.5"
              >
                <Info size={14} />
                Click To View Examination Rules
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- STUDY MATERIALS COMPANION WIDGET DIRECTLY UNDER QUIZ WORKSTATION ---------------- */}
        <div className="mt-8">
          <QuizStudyMaterialsCompanion activeSubjectId={activeSubjectCardId} />
        </div>

        {/* ---------------- RICH EDITORIAL & ADSENSE COMPLIANT EDUCATIONAL GUIDANCE ---------------- */}
        <section aria-label="JAMB UTME CBT Candidate Manual" className="mt-8 space-y-6">
          {/* 8-Key System Guide Card */}
          <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  Official CBT Navigation
                </span>
                <h3 className="text-lg font-black text-emerald-950 mt-1">
                  The JAMB 8-Key CBT Navigation System
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              In the official Unified Tertiary Matriculation Examination (UTME), candidates are provided with mouse-free keyboard shortcut capabilities. Familiarizing yourself with these 8 dedicated keys ensures rapid test traversal and saves precious time during the exam.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-2 shadow-2xs">
                  A
                </div>
                <div className="font-extrabold text-emerald-950">Option A</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Selects the first alternative choice for the current question.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-2 shadow-2xs">
                  B
                </div>
                <div className="font-extrabold text-emerald-950">Option B</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Selects the second alternative choice for the current question.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-2 shadow-2xs">
                  C
                </div>
                <div className="font-extrabold text-emerald-950">Option C</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Selects the third alternative choice for the current question.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-2 shadow-2xs">
                  D
                </div>
                <div className="font-extrabold text-emerald-950">Option D</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Selects the fourth alternative choice for the current question.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-2 shadow-2xs">
                  P
                </div>
                <div className="font-extrabold text-blue-950">Previous (P)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Moves back to the immediately preceding examination question.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-2 shadow-2xs">
                  N
                </div>
                <div className="font-extrabold text-blue-950">Next (N)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Advances instantly to the subsequent question in this subject.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-black text-sm flex items-center justify-center mb-2 shadow-2xs">
                  R
                </div>
                <div className="font-extrabold text-amber-950">Reverse / Clear</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Unselects your current option if you wish to leave it blank.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black text-sm flex items-center justify-center mb-2 shadow-2xs">
                  S
                </div>
                <div className="font-extrabold text-red-950">Submit Exam (S)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Triggers the final confirmation dialog to submit your answers.</div>
              </div>
            </div>
          </div>

          {/* UTME Mark Allocation & Structure Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scoring Architecture */}
            <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-emerald-950">
                  UTME 400-Mark Grading Structure
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                The examination consists of 180 questions distributed across four subjects, scaled to 400 aggregate points:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                  <span className="font-extrabold text-emerald-800 shrink-0">•</span>
                  <div>
                    <strong className="text-emerald-950">Use of English (Compulsory):</strong> 60 Questions · Comprehension, Lexis & Structure, Oral Forms, and Prescribed Literature Novel.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                  <span className="font-extrabold text-emerald-800 shrink-0">•</span>
                  <div>
                    <strong className="text-emerald-950">Elective Subject 1:</strong> 40 Questions · 100 scaled marks.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                  <span className="font-extrabold text-emerald-800 shrink-0">•</span>
                  <div>
                    <strong className="text-emerald-950">Elective Subject 2:</strong> 40 Questions · 100 scaled marks.
                  </div>
                </li>
                <li className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                  <span className="font-extrabold text-emerald-800 shrink-0">•</span>
                  <div>
                    <strong className="text-emerald-950">Elective Subject 3:</strong> 40 Questions · 100 scaled marks.
                  </div>
                </li>
              </ul>
            </div>

            {/* Time Management Strategy */}
            <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-emerald-950">
                  120-Minute Time Management Strategy
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                With 120 minutes for 180 questions, you have an average of 40 seconds per question. Proven pacing guidelines:
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900">First 35 Minutes:</span> Answer Use of English comprehension and lexis while your mind is freshest.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900">Next 60 Minutes:</span> Tackle calculation and core science or commercial electives (approx. 20 mins per elective).
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900">Final 25 Minutes:</span> Review all flagged / bookmarked questions, verify calculations, and confirm no answers were left unselected.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Frequently Asked Questions Section (AdSense Rich Content) */}
          <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  AdSense & Candidate FAQ Hub
                </span>
                <h3 className="text-lg font-black text-emerald-950 mt-1">
                  Frequently Asked Questions (FAQ)
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-emerald-100 rounded-2xl overflow-hidden transition-all bg-emerald-50/20"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-emerald-950 hover:bg-emerald-50/60 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-700 leading-relaxed border-t border-emerald-100/60 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Instructions Modal */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      {/* Topic Selection Modal */}
      {topicModalSubjectId && (
        <TopicSelectorModal
          isOpen={!!topicModalSubjectId}
          onClose={() => setTopicModalSubjectId(null)}
          subjectName={
            subjects.find((s) => s.id === topicModalSubjectId)?.name || 'Subject'
          }
          topics={currentTopics}
          selectedTopicIds={
            subjectConfigs[topicModalSubjectId]?.selectedTopics || []
          }
          onToggleTopic={handleToggleTopic}
          onSelectAll={handleSelectAllTopics}
          onClearAll={handleClearAllTopics}
        />
      )}
    </div>
  );
};
