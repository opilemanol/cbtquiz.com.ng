import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { submitErrorReport } from '../../services/cbtService';
import type { UserReport } from '../../types';
import { MathScientificText } from '../common/MathScientificText';

interface ReportErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  questionText: string;
  subjectName: string;
  username: string;
}

export const ReportErrorModal: React.FC<ReportErrorModalProps> = ({
  isOpen,
  onClose,
  questionId,
  questionText,
  subjectName,
  username,
}) => {
  const [category, setCategory] = useState<UserReport['category']>('Typographical error');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      await submitErrorReport({
        questionId,
        questionTextSnippet: questionText.slice(0, 100),
        subjectName,
        category,
        description: description.trim(),
        username: username || 'Candidate',
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDescription('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-400 overflow-hidden">
        {/* Header */}
        <div className="bg-[#b71c1c] text-white px-4 py-2.5 flex items-center justify-between font-semibold text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={17} />
            <span>REPORT QUESTION ERROR / DISCREPANCY</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/20 rounded text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="mx-auto text-green-600 w-12 h-12" />
            <h4 className="font-bold text-gray-900 text-base">Report Submitted Successfully</h4>
            <p className="text-gray-600 text-xs">
              Thank you for flagging this item. Our academic review panel will investigate this question.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs text-gray-700">
            <div>
              <span className="font-bold text-gray-900 block mb-1">Subject & Question ID:</span>
              <div className="bg-gray-100 p-2 rounded border border-gray-200 text-gray-800 font-mono text-[11px]">
                {subjectName} • ID: {questionId}
              </div>
              <div className="mt-1 text-gray-500 italic truncate max-w-sm">
                "<MathScientificText text={questionText} />"
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1">Issue Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
              >
                <option value="Typographical error">Typographical / Spelling error</option>
                <option value="Wrong question">Wrong question or missing diagram</option>
                <option value="Wrong option">Wrong or duplicate options</option>
                <option value="Incorrect answer">Incorrect answer marked</option>
                <option value="Other">Other discrepancy</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-900 block mb-1">Detailed Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Briefly describe what is wrong with this question or its options..."
                required
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="px-4 py-1.5 bg-[#b71c1c] hover:bg-red-800 text-white rounded font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
