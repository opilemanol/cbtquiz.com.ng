import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Home,
  User,
  Calendar,
  Layers
} from 'lucide-react';
import type { ExamAttempt } from '../../types';

interface ExamResultScreenProps {
  attempt: ExamAttempt;
  onReviewAnswers: () => void;
  onRetakeExam: () => void;
  onBackToDashboard: () => void;
}

export const ExamResultScreen: React.FC<ExamResultScreenProps> = ({
  attempt,
  onReviewAnswers,
  onRetakeExam,
  onBackToDashboard,
}) => {
  useEffect(() => {
    if (attempt.percentage >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.percentage]);

  const formatSeconds = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeRemaining = Math.max(0, attempt.timeLimitSeconds - attempt.timeUsedSeconds);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans select-none text-slate-800">
      {/* Header */}
      <header className="bg-[#1e5622] text-white px-4 sm:px-8 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={20} />
          <span className="font-bold text-base tracking-wide">
            JAMB UTME CBT EXAMINATION RESULT SLIP
          </span>
        </div>
        <button
          onClick={onBackToDashboard}
          className="p-1.5 hover:bg-green-700 rounded text-white flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <Home size={16} />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
      </header>

      {/* Main Result Sheet */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-[#1e5622] to-[#2e7d32] text-white p-6 text-center">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
              OFFICIAL CBT EXAMINATION PERFORMANCE REPORT
            </h2>
            <p className="text-xs text-green-100 mt-1">
              JOINT ADMISSIONS AND MATRICULATION BOARD UTME PRACTICE SYSTEM
            </p>
          </div>

          {/* Candidate & Exam Metadata */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/70 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <User size={16} className="text-[#1e5622] mt-0.5" />
              <div>
                <span className="text-gray-500 block text-[10px]">CANDIDATE NAME</span>
                <span className="font-bold text-gray-900 text-sm uppercase">{attempt.username}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Layers size={16} className="text-[#1e5622] mt-0.5" />
              <div>
                <span className="text-gray-500 block text-[10px]">EXAMINATION / MODE</span>
                <span className="font-bold text-gray-900">JAMB UTME ({attempt.mode})</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar size={16} className="text-[#1e5622] mt-0.5" />
              <div>
                <span className="text-gray-500 block text-[10px]">DATE & TIME</span>
                <span className="font-bold text-gray-900">
                  {new Date(attempt.startedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock size={16} className="text-[#1e5622] mt-0.5" />
              <div>
                <span className="text-gray-500 block text-[10px]">TIME CONSUMED</span>
                <span className="font-bold text-gray-900 font-mono">
                  {formatSeconds(attempt.timeUsedSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Score Hero */}
          <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-around gap-6 border-b border-gray-200 bg-white">
            {/* Big Score Callout */}
            <div className="text-center md:text-left space-y-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
                AGGREGATE SCORE
              </span>
              <div className="text-4xl sm:text-5xl font-black text-[#1e5622] tracking-tight">
                {attempt.score} <span className="text-2xl text-gray-400 font-bold">/ {attempt.totalQuestions}</span>
              </div>
              <div className="text-xs text-gray-600">
                Performance Rating:{' '}
                <span className={`font-bold ${attempt.percentage >= 60 ? 'text-green-700' : 'text-red-700'}`}>
                  {attempt.percentage >= 75 ? 'DISTINCTION' : attempt.percentage >= 50 ? 'CREDIT' : 'NEEDS PRACTICE'}
                </span>
              </div>
            </div>

            {/* Circular Percentage Pill */}
            <div className="flex items-center gap-4">
              <div
                className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-inner ${
                  attempt.percentage >= 60
                    ? 'border-green-600 bg-green-50 text-green-800'
                    : 'border-amber-500 bg-amber-50 text-amber-900'
                }`}
              >
                <span className="text-3xl font-black">{attempt.percentage}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">PERCENTAGE</span>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 text-center">
            <div className="bg-white p-3.5 rounded border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500 block mb-1">TOTAL QUESTIONS</span>
              <span className="text-xl font-bold text-gray-800">{attempt.totalQuestions}</span>
            </div>

            <div className="bg-white p-3.5 rounded border border-green-200 shadow-xs">
              <span className="text-[11px] font-semibold text-green-700 flex items-center justify-center gap-1 mb-1">
                <CheckCircle size={14} /> CORRECT
              </span>
              <span className="text-xl font-bold text-green-700">{attempt.correct}</span>
            </div>

            <div className="bg-white p-3.5 rounded border border-red-200 shadow-xs">
              <span className="text-[11px] font-semibold text-red-600 flex items-center justify-center gap-1 mb-1">
                <XCircle size={14} /> INCORRECT
              </span>
              <span className="text-xl font-bold text-red-600">{attempt.incorrect}</span>
            </div>

            <div className="bg-white p-3.5 rounded border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-600 flex items-center justify-center gap-1 mb-1">
                <AlertCircle size={14} /> UNATTEMPTED
              </span>
              <span className="text-xl font-bold text-gray-600">{attempt.unanswered}</span>
            </div>
          </div>

          {/* Tested Subjects */}
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Subjects Examined:
            </h4>
            <div className="flex flex-wrap gap-2">
              {attempt.subjectNames.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-green-100 text-[#1e5622] border border-green-300 font-semibold px-3 py-1 rounded text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gray-100 border-t border-gray-200 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 border border-gray-300 rounded font-semibold text-xs text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <Home size={14} />
              Back to Dashboard
            </button>

            <button
              onClick={onRetakeExam}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs transition-colors shadow flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              Retake Examination
            </button>

            <button
              onClick={onReviewAnswers}
              className="px-5 py-2 bg-[#1e5622] hover:bg-[#163f19] text-white rounded font-bold text-xs transition-colors shadow flex items-center gap-1.5"
            >
              <BookOpen size={14} />
              Review Answers & Solutions
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
