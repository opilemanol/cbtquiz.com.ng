import React, { useEffect, useState } from 'react';
import { X, History, Award, BookOpen, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import type { ExamAttempt } from '../../types';
import { getUserAttempts } from '../../services/cbtService';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onSelectAttemptForReview: (attempt: ExamAttempt) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  username,
  onSelectAttemptForReview,
}) => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getUserAttempts(username)
        .then((list) => setAttempts(list))
        .catch(() => setAttempts([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, username]);

  if (!isOpen) return null;

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((acc, cur) => acc + cur.percentage, 0) / totalAttempts)
    : 0;
  const highestScore = totalAttempts > 0
    ? Math.max(...attempts.map((a) => a.percentage))
    : 0;
  const totalQuestionsDone = attempts.reduce((acc, cur) => acc + (cur.attempted || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-400 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#1e5622] text-white px-5 py-3 flex items-center justify-between font-bold text-sm">
          <div className="flex items-center gap-2">
            <History size={18} />
            <span>PRACTICE ATTEMPTS & CBT PERFORMANCE HISTORY</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/20 rounded text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Analytics Summary */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-white p-2.5 rounded border border-gray-200">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">Total Sessions</span>
            <span className="text-lg font-bold text-gray-900">{totalAttempts}</span>
          </div>

          <div className="bg-white p-2.5 rounded border border-gray-200">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">Average Score</span>
            <span className="text-lg font-bold text-blue-700">{avgScore}%</span>
          </div>

          <div className="bg-white p-2.5 rounded border border-gray-200">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">Peak Score</span>
            <span className="text-lg font-bold text-green-700">{highestScore}%</span>
          </div>

          <div className="bg-white p-2.5 rounded border border-gray-200">
            <span className="text-[10px] text-gray-500 font-semibold uppercase block">Questions Solved</span>
            <span className="text-lg font-bold text-gray-800">{totalQuestionsDone}</span>
          </div>
        </div>

        {/* List of Attempts */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {loading ? (
            <p className="text-center py-8 text-xs text-gray-400">Loading history records...</p>
          ) : attempts.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500">
              <Award size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-700">No examination attempts logged yet.</p>
              <p className="text-gray-400 text-[11px] mt-0.5">Click "Get Started" on the dashboard to take your first test.</p>
            </div>
          ) : (
            attempts.map((att) => (
              <div
                key={att.id}
                className="bg-white border border-gray-200 hover:border-green-600 rounded p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      Score: {att.score} / {att.totalQuestions} ({att.percentage}%)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        att.percentage >= 60 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {att.mode}
                    </span>
                  </div>
                  <div className="text-gray-600 text-[11px] flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(att.startedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {Math.round(att.timeUsedSeconds / 60)} mins used
                    </span>
                  </div>
                  <div className="text-gray-500 text-[11px]">
                    Subjects: {att.subjectNames?.join(', ') || 'General'}
                  </div>
                </div>

                <button
                  onClick={() => onSelectAttemptForReview(att)}
                  className="px-3.5 py-1.5 bg-[#1e5622] hover:bg-[#163f19] text-white rounded font-semibold text-xs flex items-center justify-center gap-1.5 self-start sm:self-center transition-colors shadow-xs"
                >
                  <BookOpen size={13} />
                  Review Answers
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-5 py-2.5 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-gray-300 rounded font-semibold text-xs text-gray-700 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
