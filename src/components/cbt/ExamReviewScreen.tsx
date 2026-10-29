import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import type { ExamAttempt } from '../../types';
import { MathScientificText } from '../common/MathScientificText';

interface ExamReviewScreenProps {
  attempt: ExamAttempt;
  onBackToResult: () => void;
  onBackToDashboard: () => void;
}

export const ExamReviewScreen: React.FC<ExamReviewScreenProps> = ({
  attempt,
  onBackToResult,
  onBackToDashboard,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const results = attempt.questionResults || [];

  const filteredResults = results.filter((q) => {
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'incorrect') return typeof q.selectedAnswerIndex === 'number' && !q.isCorrect;
    if (filter === 'unanswered') return typeof q.selectedAnswerIndex !== 'number';
    return true;
  });

  const currentQ = filteredResults[currentIndex] || results[0];

  const handleNext = () => {
    if (currentIndex < filteredResults.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded shadow text-center max-w-sm">
          <p className="text-gray-600 text-sm mb-4">No detailed review items available for this session.</p>
          <button
            onClick={onBackToResult}
            className="px-4 py-2 bg-[#1e5622] text-white rounded text-xs font-bold"
          >
            Back to Result Slip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans select-none text-slate-800">
      {/* Header */}
      <header className="bg-[#1e5622] text-white px-4 sm:px-8 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToResult}
            className="p-1 hover:bg-green-700 rounded transition-colors text-white"
            title="Back to result sheet"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
              <BookOpen size={16} />
              DETAILED QUESTION REVIEW & STEP-BY-STEP SOLUTIONS
            </h1>
            <span className="text-[11px] text-green-200">
              Candidate: {attempt.username} • Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
            </span>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="px-3 py-1 bg-green-800 hover:bg-green-900 text-white rounded text-xs font-semibold"
        >
          Exit Review
        </button>
      </header>

      {/* Filter Toolbar */}
      <div className="bg-white border-b border-gray-300 px-4 sm:px-8 py-2.5 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-gray-600">
            <Filter size={14} />
            <span>Filter Questions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => { setFilter('all'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({results.length})
            </button>
            <button
              onClick={() => { setFilter('correct'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                filter === 'correct'
                  ? 'bg-green-700 text-white'
                  : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
              }`}
            >
              <CheckCircle2 size={12} /> Correct ({attempt.correct})
            </button>
            <button
              onClick={() => { setFilter('incorrect'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                filter === 'incorrect'
                  ? 'bg-red-700 text-white'
                  : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
              }`}
            >
              <XCircle size={12} /> Incorrect ({attempt.incorrect})
            </button>
            <button
              onClick={() => { setFilter('unanswered'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                filter === 'unanswered'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <HelpCircle size={12} /> Unattempted ({attempt.unanswered})
            </button>
          </div>
        </div>
      </div>

      {/* Main Review Panel */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {filteredResults.length === 0 ? (
          <div className="bg-white p-8 rounded border border-gray-300 text-center text-gray-500 text-xs">
            No questions matching the selected filter ({filter}).
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden p-6 space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-900">
                  Question {currentIndex + 1} of {filteredResults.length}
                </span>
                <span className="bg-green-100 text-[#1e5622] font-semibold text-xs px-2.5 py-0.5 rounded">
                  {currentQ.subjectName}
                </span>
              </div>

              {/* Status Badge */}
              <div>
                {currentQ.isCorrect ? (
                  <span className="bg-green-100 border border-green-300 text-green-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-green-600" /> CORRECT (+1 Mark)
                  </span>
                ) : typeof currentQ.selectedAnswerIndex === 'number' ? (
                  <span className="bg-red-100 border border-red-300 text-red-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <XCircle size={14} className="text-red-600" /> INCORRECT (0 Marks)
                  </span>
                ) : (
                  <span className="bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <HelpCircle size={14} className="text-amber-600" /> UNATTEMPTED
                  </span>
                )}
              </div>
            </div>

            {/* Passage if any */}
            {currentQ.passage && (
              <div className="p-3 bg-amber-50/70 border-l-4 border-green-700 text-xs font-serif text-gray-800 italic leading-relaxed">
                <MathScientificText text={currentQ.passage} />
              </div>
            )}

            {/* Question Text */}
            <div className="text-sm font-semibold text-gray-900 leading-relaxed">
              <MathScientificText text={currentQ.questionText} />
            </div>

            {/* Options display with color coded selection */}
            <div className="space-y-2.5 max-w-3xl">
              {currentQ.options.map((opt, oIdx) => {
                const letter = String.fromCharCode(65 + oIdx);
                const isCorrectOption = oIdx === currentQ.correctAnswerIndex;
                const isCandidateChoice = oIdx === currentQ.selectedAnswerIndex;

                let cardStyle = 'border-gray-200 bg-white text-gray-700';
                if (isCorrectOption) {
                  cardStyle = 'border-green-600 bg-green-50 font-bold text-green-900 ring-1 ring-green-600';
                } else if (isCandidateChoice && !currentQ.isCorrect) {
                  cardStyle = 'border-red-500 bg-red-50 font-semibold text-red-900 ring-1 ring-red-500';
                }

                return (
                  <div
                    key={oIdx}
                    className={`p-3 rounded border text-xs sm:text-sm flex items-start gap-3 transition-colors ${cardStyle}`}
                  >
                    <span className="font-bold w-4 shrink-0">{letter}.</span>
                    <span className="flex-1">
                      <MathScientificText text={opt} />
                    </span>
                    {isCorrectOption && (
                      <span className="shrink-0 text-[11px] bg-green-700 text-white font-bold px-2 py-0.5 rounded">
                        ✓ Correct Answer
                      </span>
                    )}
                    {isCandidateChoice && !isCorrectOption && (
                      <span className="shrink-0 text-[11px] bg-red-700 text-white font-bold px-2 py-0.5 rounded">
                        ✗ Your Choice
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Solution & Detailed Explanation */}
            <div className="bg-blue-50/80 border border-blue-200 rounded p-4 text-xs text-blue-950 space-y-1.5">
              <h4 className="font-bold flex items-center gap-1.5 text-blue-900">
                <Info size={15} />
                Detailed Solution & Syllabus Explanation:
              </h4>
              <div className="leading-relaxed pl-5 text-gray-800">
                <MathScientificText text={currentQ.solution || 'The marked choice represents the standard syllabus answer for this UTME test item.'} />
              </div>
            </div>

            {/* Step navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 py-2 border border-gray-300 rounded font-semibold text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous Question
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === filteredResults.length - 1}
                className="px-5 py-2 bg-[#1e5622] hover:bg-[#163f19] text-white rounded font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow"
              >
                Next Question <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
