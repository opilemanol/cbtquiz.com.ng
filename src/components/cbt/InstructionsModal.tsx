import React from 'react';
import { X, BookOpen, Clock, AlertCircle, CheckSquare, Keyboard } from 'lucide-react';
import { JAMB_INSTRUCTIONS_TEXT } from '../../lib/seedData';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-400 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#1e5622] text-white px-5 py-3 flex items-center justify-between font-bold text-sm tracking-wide">
          <div className="flex items-center gap-2">
            <BookOpen size={18} />
            <span>JAMB UTME CBT EXAMINATION WORKSTATION INSTRUCTIONS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/20 rounded text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-gray-700 leading-relaxed">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-amber-900 flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Important Candidate Notice</p>
              <p className="text-[11px] mt-0.5">
                Read all instructions carefully before clicking Start or continuing your examination session.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="border border-gray-200 rounded p-3 bg-gray-50">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5 text-xs">
                <Clock size={14} className="text-green-700" />
                Examination Timing
              </h4>
              <p className="text-gray-600 text-[11px]">
                The timer counts down every second from your configured duration (default: 2 hours). When the timer reaches 00:00:00, your exam is immediately submitted automatically.
              </p>
            </div>

            <div className="border border-gray-200 rounded p-3 bg-gray-50">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-1.5 text-xs">
                <CheckSquare size={14} className="text-blue-700" />
                Keypad Legend
              </h4>
              <ul className="text-gray-600 text-[11px] space-y-1">
                <li><span className="inline-block w-3 h-3 bg-blue-600 rounded-sm mr-1.5 align-middle"></span> <strong>Blue:</strong> Current Question</li>
                <li><span className="inline-block w-3 h-3 bg-green-600 rounded-sm mr-1.5 align-middle"></span> <strong>Green:</strong> Answered Question</li>
                <li><span className="inline-block w-3 h-3 bg-amber-400 rounded-sm mr-1.5 align-middle"></span> <strong>Yellow:</strong> Bookmarked / Marked for Review</li>
                <li><span className="inline-block w-3 h-3 bg-white border border-gray-400 rounded-sm mr-1.5 align-middle"></span> <strong>White:</strong> Unvisited</li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-200 rounded p-3 bg-blue-50/60">
            <h4 className="font-bold text-blue-950 flex items-center gap-1.5 mb-1.5 text-xs">
              <Keyboard size={14} className="text-blue-700" />
              Keyboard Shortcuts (Real JAMB CBT 8-Key Standard)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-gray-800">
              <div className="bg-white border border-blue-200 rounded px-2 py-1"><kbd className="font-bold text-blue-700">A, B, C, D</kbd>: Select Option</div>
              <div className="bg-white border border-blue-200 rounded px-2 py-1"><kbd className="font-bold text-blue-700">P / ←</kbd>: Previous Question</div>
              <div className="bg-white border border-blue-200 rounded px-2 py-1"><kbd className="font-bold text-blue-700">N / →</kbd>: Next Question</div>
              <div className="bg-white border border-blue-200 rounded px-2 py-1"><kbd className="font-bold text-blue-700">S</kbd>: Submit Exam</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <h4 className="font-bold text-gray-900 mb-2">Detailed Rules</h4>
            <div className="text-[11px] text-gray-600 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto bg-gray-50 p-3 rounded border border-gray-200 font-mono">
              {JAMB_INSTRUCTIONS_TEXT.trim()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-5 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#1e5622] hover:bg-[#163f19] text-white rounded text-xs font-bold transition-colors shadow"
          >
            I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
