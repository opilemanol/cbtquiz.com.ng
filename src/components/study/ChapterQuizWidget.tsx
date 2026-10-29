import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  Loader2
} from 'lucide-react';
import type { Question } from '../../types';
import { getQuestionsBySubject, shuffleArray } from '../../services/cbtService';
import { MathScientificText } from '../common/MathScientificText';

interface ChapterQuizWidgetProps {
  subjectId: string;
  subjectName: string;
  chapterNumber: number;
  chapterTitle: string;
  onTakeFullQuiz?: () => void;
}

export const ChapterQuizWidget: React.FC<ChapterQuizWidgetProps> = ({
  subjectId,
  subjectName,
  chapterNumber,
  chapterTitle,
  onTakeFullQuiz,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchQuestions() {
      setLoading(true);
      try {
        const pool = await getQuestionsBySubject(subjectId);
        if (isMounted) {
          if (pool && pool.length > 0) {
            // Randomly shuffle the pool and take 5 questions on every refresh or new attempt
            const shuffled = shuffleArray(pool);
            setQuestions(shuffled.slice(0, Math.min(5, shuffled.length)));
          } else {
            setQuestions([]);
          }
        }
      } catch (err) {
        console.warn('Error fetching chapter quiz questions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchQuestions();
    setUserAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);

    return () => {
      isMounted = false;
    };
  }, [subjectId, chapterNumber]);

  const handleSelectOption = (optionIndex: number) => {
    if (userAnswers[currentIndex] !== undefined) return; // already answered
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="bg-emerald-50/40 rounded-3xl border border-emerald-100 p-8 text-center my-8">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-emerald-800 font-semibold">
          Loading chapter practice questions for Chapter {chapterNumber}...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const isCompleted = answeredCount === questions.length;
  const correctCount = questions.reduce((acc, q, idx) => {
    return userAnswers[idx] === q.correctAnswerIndex ? acc + 1 : acc;
  }, 0);

  const selectedAnswer = userAnswers[currentIndex];
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = isAnswered && selectedAnswer === currentQ.correctAnswerIndex;

  return (
    <section aria-label="Chapter Practice Quiz" className="my-10 bg-white rounded-3xl border-2 border-emerald-500/25 p-6 sm:p-8 shadow-xs">
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-emerald-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100/70 text-emerald-900 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Interactive Chapter Drill • 100% Free Public Access</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950 mt-2">
            Chapter {chapterNumber} Knowledge Check: {chapterTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Test your comprehension of this chapter with authentic JAMB UTME style questions and immediate worked solutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">
              Drill Progress
            </div>
            <div className="text-xs font-black text-emerald-900">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs">
            {answeredCount}/{questions.length}
          </div>
        </div>
      </div>

      {/* Completion Summary Card */}
      {isCompleted && (
        <div className="my-6 p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-950">
                Chapter {chapterNumber} Practice Completed!
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                You scored <span className="font-bold text-emerald-800">{correctCount} of {questions.length}</span> correct ({Math.round((correctCount / questions.length) * 100)}%).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Retry Drill</span>
            </button>
            {onTakeFullQuiz && (
              <button
                onClick={onTakeFullQuiz}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Full Timed CBT Exam</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className="pt-6">
        {/* Optional Passage */}
        {currentQ.passage && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 font-sans">
              Comprehension Context / Passage:
            </div>
            <MathScientificText text={currentQ.passage} />
          </div>
        )}

        {/* Question Text */}
        <div className="text-sm sm:text-base font-bold text-emerald-950 leading-relaxed mb-6">
          <span className="inline-block text-emerald-700 mr-2">
            Q{currentIndex + 1}.
          </span>
          <MathScientificText text={currentQ.questionText} />
        </div>

        {/* Options Grid */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((optText, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isThisSelected = selectedAnswer === optIdx;
            const isThisCorrect = optIdx === currentQ.correctAnswerIndex;

            let buttonStyle = 'bg-white hover:bg-emerald-50/70 border-slate-200 text-slate-800';
            let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';

            if (isAnswered) {
              if (isThisCorrect) {
                buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
              } else if (isThisSelected && !isThisCorrect) {
                buttonStyle = 'bg-red-50 border-red-400 text-red-950 font-medium ring-1 ring-red-400';
                badgeStyle = 'bg-red-600 text-white border-red-600';
              } else {
                buttonStyle = 'bg-white opacity-55 border-slate-200 text-slate-600';
              }
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${buttonStyle} cursor-pointer disabled:cursor-default`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${badgeStyle}`}
                >
                  {letter}
                </div>
                <div className="flex-1 text-xs sm:text-sm pt-0.5 leading-relaxed">
                  <MathScientificText text={optText} />
                </div>
                {isAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                )}
                {isAnswered && isThisSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation / Solution Panel */}
        {showExplanation[currentIndex] && (
          <div
            className={`p-5 rounded-2xl border mb-6 text-xs sm:text-sm leading-relaxed ${
              isCorrect
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-900 font-extrabold">Correct! Solution & Explanation:</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-900 font-extrabold">
                    Incorrect. Correct Option is {String.fromCharCode(65 + currentQ.correctAnswerIndex)}:
                  </span>
                </>
              )}
            </div>
            <div className="text-slate-700 mt-1">
              {currentQ.solution ? (
                <MathScientificText text={currentQ.solution} />
              ) : (
                <p>The standard examination answer for this curriculum concept is option {String.fromCharCode(65 + currentQ.correctAnswerIndex)}.</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200 text-emerald-800 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {questions.map((_, dotIdx) => {
              const isDotCurrent = dotIdx === currentIndex;
              const hasAnswer = userAnswers[dotIdx] !== undefined;
              const isDotCorrect = hasAnswer && userAnswers[dotIdx] === questions[dotIdx].correctAnswerIndex;

              let dotColor = 'bg-slate-200';
              if (isDotCurrent) {
                dotColor = 'bg-emerald-600 ring-2 ring-emerald-300';
              } else if (hasAnswer) {
                dotColor = isDotCorrect ? 'bg-emerald-500' : 'bg-red-400';
              }

              return (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${dotColor}`}
                  title={`Go to Question ${dotIdx + 1}`}
                />
              );
            })}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
