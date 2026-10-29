import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredCount: number;
  timeRemainingFormatted: string;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  timeRemainingFormatted,
}) => {
  if (!isOpen) return null;

  const unanswered = Math.max(0, totalQuestions - answeredCount);
  const percentageAnswered = Math.round((answeredCount / (totalQuestions || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-400 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Red header consistent with CBT Submit action */}
        <div className="bg-[#c62828] text-white px-5 py-3 flex items-center justify-between font-bold text-sm tracking-wide">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>SUBMIT EXAMINATION AUDIT</span>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs text-gray-700">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-gray-900">Are you sure you want to submit?</h3>
            <p className="text-gray-500 text-xs">
              Once submitted, your responses will be locked and your final score computed.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between py-1 border-b border-gray-200">
              <span className="font-semibold text-gray-700">Total Questions:</span>
              <span className="font-bold text-gray-900 text-sm">{totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-200">
              <span className="font-semibold text-green-700 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Answered Questions:
              </span>
              <span className="font-bold text-green-700 text-sm">{answeredCount} ({percentageAnswered}%)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-200">
              <span className="font-semibold text-red-600 flex items-center gap-1.5">
                <AlertCircle size={14} /> Unanswered Questions:
              </span>
              <span className="font-bold text-red-600 text-sm">{unanswered}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Clock size={14} /> Time Remaining:
              </span>
              <span className="font-bold text-gray-900 text-sm font-mono">{timeRemainingFormatted}</span>
            </div>
          </div>

          {unanswered > 0 && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
              ⚠️ You still have <span className="font-bold">{unanswered} unanswered</span> questions. You may return to complete them if time permits.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel & Continue Exam
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2 bg-[#c62828] hover:bg-red-800 text-white rounded font-bold transition-colors shadow active:scale-95"
            >
              Yes, Submit Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
