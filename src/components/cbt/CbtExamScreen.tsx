import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Calculator,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  Volume2
} from 'lucide-react';
import type { Question, ExamAttempt, ExamMode } from '../../types';
import { CalculatorModal } from './CalculatorModal';
import { DictionaryModal } from './DictionaryModal';
import { ReportErrorModal } from './ReportErrorModal';
import { SubmitConfirmModal } from './SubmitConfirmModal';
import { saveExamAttempt } from '../../services/cbtService';
import { MathScientificText } from '../common/MathScientificText';
import { QuizStudyMaterialsCompanion } from '../study/QuizStudyMaterialsCompanion';

interface PreparedQuestionItem {
  question: Question;
  displayOptions: string[];
  originalIndicesMap: number[];
}

interface CbtExamScreenProps {
  attemptId: string;
  username: string;
  mode: ExamMode;
  questions: PreparedQuestionItem[];
  totalTimeSeconds: number;
  onFinishExam: (attempt: ExamAttempt) => void;
  onExitExam: () => void;
}

export const CbtExamScreen: React.FC<CbtExamScreenProps> = ({
  attemptId,
  username,
  mode,
  questions,
  totalTimeSeconds,
  onFinishExam,
  onExitExam,
}) => {
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem(`cbt_answers_${attemptId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [bookmarks, setBookmarks] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem(`cbt_bookmarks_${attemptId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [attemptedQuestions, setAttemptedQuestions] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem(`cbt_attempted_${attemptId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const savedTime = localStorage.getItem(`cbt_time_${attemptId}`);
    return savedTime !== null ? parseInt(savedTime, 10) : totalTimeSeconds;
  });

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  // Group questions by subject
  const subjectList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; firstIndex: number; count: number }>();
    questions.forEach((q, idx) => {
      const sId = q.question.subjectId;
      const sName = q.question.subjectName;
      if (!map.has(sId)) {
        map.set(sId, { id: sId, name: sName, firstIndex: idx, count: 1 });
      } else {
        const item = map.get(sId)!;
        item.count += 1;
      }
    });
    return Array.from(map.values());
  }, [questions]);

  const currentItem = questions[currentIndex] || questions[0];
  const currentSubjectId = currentItem?.question.subjectId;

  // Track attempted questions
  useEffect(() => {
    setAttemptedQuestions((prev) => {
      if (prev[currentIndex]) return prev;
      const updated = { ...prev, [currentIndex]: true };
      localStorage.setItem(`cbt_attempted_${attemptId}`, JSON.stringify(updated));
      return updated;
    });
  }, [currentIndex, attemptId]);

  // Persist answers to localStorage
  useEffect(() => {
    localStorage.setItem(`cbt_answers_${attemptId}`, JSON.stringify(answers));
  }, [answers, attemptId]);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem(`cbt_bookmarks_${attemptId}`, JSON.stringify(bookmarks));
  }, [bookmarks, attemptId]);

  // Execute submission
  const executeSubmission = useCallback(async () => {
    const timeUsed = totalTimeSeconds - timeLeft;
    let correctCount = 0;
    let incorrectCount = 0;
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;

    const subjectScores: Record<string, { total: number; attempted: number; correct: number; score: number }> = {};
    subjectList.forEach((s) => {
      subjectScores[s.id] = { total: s.count, attempted: 0, correct: 0, score: 0 };
    });

    const questionResults = questions.map((item, idx) => {
      const selectedDisplayIdx = answers[idx];
      let selectedOriginalIdx: number | undefined;
      let isCorrect = false;

      if (typeof selectedDisplayIdx === 'number') {
        selectedOriginalIdx = item.originalIndicesMap[selectedDisplayIdx];
        isCorrect = selectedOriginalIdx === item.question.correctAnswerIndex;
        if (isCorrect) correctCount++;
        else incorrectCount++;

        const sId = item.question.subjectId;
        if (subjectScores[sId]) {
          subjectScores[sId].attempted += 1;
          if (isCorrect) subjectScores[sId].correct += 1;
        }
      }

      return {
        questionId: item.question.id,
        subjectId: item.question.subjectId,
        subjectName: item.question.subjectName,
        passage: item.question.passage,
        questionText: item.question.questionText,
        options: item.question.options,
        selectedAnswerIndex: selectedOriginalIdx,
        correctAnswerIndex: item.question.correctAnswerIndex,
        isCorrect,
        solution: item.question.solution,
      };
    });

    Object.keys(subjectScores).forEach((sId) => {
      const s = subjectScores[sId];
      s.score = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    });

    const scaledScore = questions.length > 0 ? Math.round((correctCount / questions.length) * 400) : 0;
    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    const attempt: ExamAttempt = {
      id: attemptId,
      username: username || 'PROSPER',
      mode,
      subjects: subjectList.map((s) => s.id),
      subjectNames: subjectList.map((s) => s.name),
      totalQuestions: questions.length,
      attempted: answeredCount,
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: unansweredCount,
      score: scaledScore,
      percentage,
      timeLimitSeconds: totalTimeSeconds,
      timeUsedSeconds: Math.max(timeUsed, 1),
      startedAt: new Date(Date.now() - timeUsed * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      status: 'completed',
      subjectScores,
      questionResults,
    };

    localStorage.removeItem(`cbt_answers_${attemptId}`);
    localStorage.removeItem(`cbt_bookmarks_${attemptId}`);
    localStorage.removeItem(`cbt_time_${attemptId}`);
    localStorage.removeItem(`cbt_attempted_${attemptId}`);

    await saveExamAttempt(attempt);
    onFinishExam(attempt);
  }, [answers, attemptId, mode, onFinishExam, questions, subjectList, timeLeft, totalTimeSeconds, username]);

  // Timer countdown
  useEffect(() => {
    if (mode === 'practice' && totalTimeSeconds === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSubmission();
          return 0;
        }
        const updated = prev - 1;
        if (updated % 5 === 0) {
          localStorage.setItem(`cbt_time_${attemptId}`, updated.toString());
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, totalTimeSeconds, attemptId, executeSubmission]);

  const handleSelectOption = (displayIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: displayIndex,
    }));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const toggleBookmark = () => {
    setBookmarks((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find index relative to current subject
  const currentSubjectInfo = subjectList.find((s) => s.id === currentSubjectId);
  const subjectQuestionNum = currentSubjectInfo
    ? currentIndex - currentSubjectInfo.firstIndex + 1
    : currentIndex + 1;
  const subjectTotalQuestions = currentSubjectInfo ? currentSubjectInfo.count : questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="flex-1 p-3 sm:p-6 bg-white min-h-screen flex flex-col justify-between">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT / CENTER: EXAM WORKSTATION (WHITE & GREEN BRAND) */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col bg-white rounded-2xl shadow-xs border-2 border-emerald-500/20 overflow-hidden">
          {/* Green Top Bar */}
          <div className="bg-[#137547] text-white px-5 py-3.5 flex items-center justify-between shadow-xs">
            <button
              onClick={onExitExam}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold hover:text-emerald-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Exit Quiz</span>
            </button>

            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculator</span>
            </button>

            <button
              onClick={toggleBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                bookmarks[currentIndex] ? 'text-amber-300 bg-white/10' : 'text-white hover:bg-white/10'
              }`}
              title="Bookmark / Flag Question"
            >
              <Star
                className="w-4 h-4"
                fill={bookmarks[currentIndex] ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Subject Tabs */}
          <div className="px-5 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-2 overflow-x-auto">
            {subjectList.map((subj) => {
              const isActive = subj.id === currentSubjectId;
              return (
                <button
                  key={subj.id}
                  onClick={() => setCurrentIndex(subj.firstIndex)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-emerald-950 border border-emerald-200 hover:bg-emerald-100/60'
                  }`}
                >
                  {subj.name}
                </button>
              );
            })}
          </div>

          {/* Question Container */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between bg-white">
            <div>
              {/* Question Number & Timer */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-800 text-base sm:text-lg font-extrabold">
                  Question {subjectQuestionNum} of {subjectTotalQuestions}
                </span>

                <div className="flex items-center gap-1.5 text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold font-mono">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Subtitles: Subject & Standard */}
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-5">
                <span>{currentItem?.question.subjectName}</span>
                <span className="mx-1.5">·</span>
                <span>JAMB UTME Computer-Based Test</span>
              </div>

              {/* Passage if present */}
              {currentItem?.question.passage && (
                <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-950 font-serif leading-relaxed italic mb-6">
                  <MathScientificText text={currentItem.question.passage} />
                </div>
              )}

              {/* Question Text */}
              <div className="text-base sm:text-lg font-bold text-emerald-950 leading-relaxed mb-6">
                <MathScientificText text={currentItem?.question.questionText || ''} />
              </div>

              {/* Options List: Dominant White with Emerald Accents */}
              <div className="space-y-3 mb-8 max-w-2xl">
                {currentItem?.displayOptions.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = answers[currentIndex] === optIdx;

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-center gap-3.5 cursor-pointer p-3.5 rounded-2xl border-2 transition-all select-none ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                          : 'border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                    >
                      {/* Round green radio indicator */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-700'
                            : 'border-emerald-400 bg-white group-hover:border-emerald-600'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>

                      <span className="font-extrabold text-sm text-emerald-900 w-4 shrink-0">
                        {letter}
                      </span>

                      <span className="text-sm sm:text-base text-slate-800 font-medium">
                        <MathScientificText text={opt} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Previous & Next */}
            <div className="pt-6 border-t border-emerald-100 flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 border-2 border-emerald-200 hover:bg-emerald-50 disabled:opacity-30 rounded-xl text-xs sm:text-sm font-bold text-emerald-800 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-30 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-700/20"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT: QUESTION PALETTE & TEST SUMMARY (WHITE & GREEN) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-emerald-950 mb-3">
              Question Palette
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 mb-4 pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-800 inline-block" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block ring-1 ring-emerald-300" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-400 inline-block" />
                <span>Attempted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-white border border-emerald-200 inline-block" />
                <span>Unanswered</span>
              </div>
            </div>

            {/* Question numbers grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {questions.map((_, qIdx) => {
                const isCurrent = qIdx === currentIndex;
                const isAnswered = typeof answers[qIdx] === 'number';
                const isAttempted = !!attemptedQuestions[qIdx];

                let bgClass = 'bg-white text-emerald-950 border border-emerald-100 hover:bg-emerald-50';
                if (isCurrent) {
                  bgClass = 'bg-emerald-500 text-white font-bold ring-2 ring-emerald-300 shadow-xs';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-800 text-white font-bold';
                } else if (isAttempted) {
                  bgClass = 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold';
                }

                return (
                  <button
                    key={qIdx}
                    onClick={() => setCurrentIndex(qIdx)}
                    className={`h-9 rounded-xl text-xs flex items-center justify-center transition-all ${bgClass}`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Summary Box */}
          <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-emerald-950 mb-3">
              Test Summary
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center py-2 bg-emerald-50/40 rounded-xl border border-emerald-100">
              <div>
                <div className="text-[10px] text-emerald-800 font-bold uppercase">Total</div>
                <div className="text-lg font-black text-emerald-950 mt-0.5">
                  {questions.length}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-800 font-bold uppercase">Answered</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5">
                  {answeredCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-800 font-bold uppercase">Time Left</div>
                <div className="text-xs font-bold text-emerald-900 mt-1.5 font-mono">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSubmitConfirmOpen(true)}
              className="mt-4 w-full py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Examination</span>
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Study Materials & Chapter Notes Companion Under Quiz Workstation */}
      <div className="mt-8">
        <QuizStudyMaterialsCompanion activeSubjectId={currentSubjectId} />
      </div>

      {/* Auxiliary Modals */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <SubmitConfirmModal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirm={() => {
          setIsSubmitConfirmOpen(false);
          executeSubmission();
        }}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        timeRemainingFormatted={formatTime(timeLeft)}
      />
    </div>
  );
};
