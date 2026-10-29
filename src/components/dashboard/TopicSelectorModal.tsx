import React from 'react';
import { X, CheckSquare, Square, Layers } from 'lucide-react';
import type { Topic } from '../../types';

interface TopicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  topics: Topic[];
  selectedTopicIds: string[];
  onToggleTopic: (topicId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const TopicSelectorModal: React.FC<TopicSelectorModalProps> = ({
  isOpen,
  onClose,
  subjectName,
  topics,
  selectedTopicIds,
  onToggleTopic,
  onSelectAll,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const isAllSelected = topics.length > 0 && selectedTopicIds.length === topics.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-gray-400 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#1e5622] text-white px-4 py-3 flex items-center justify-between font-bold text-sm">
          <div className="flex items-center gap-2">
            <Layers size={17} />
            <span>Select Topics: {subjectName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/20 rounded text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick action bar */}
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs">
          <span className="text-gray-600">
            {selectedTopicIds.length} of {topics.length} topics selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onSelectAll}
              className="text-[#1e5622] hover:underline font-semibold"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={onClearAll}
              className="text-red-700 hover:underline font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Topic checklist */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {topics.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-6 text-center">
              All topics in {subjectName} syllabus will be included.
            </p>
          ) : (
            topics.map((t) => {
              const checked = selectedTopicIds.includes(t.id);
              return (
                <label
                  key={t.id}
                  onClick={() => onToggleTopic(t.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded border cursor-pointer text-xs transition-colors ${
                    checked
                      ? 'bg-green-50/70 border-green-500 font-semibold text-gray-900'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="text-green-700">
                    {checked ? <CheckSquare size={16} /> : <Square size={16} className="text-gray-400" />}
                  </div>
                  <span>{t.name}</span>
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-[#1e5622] hover:bg-[#163f19] text-white rounded text-xs font-bold transition-colors shadow"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
