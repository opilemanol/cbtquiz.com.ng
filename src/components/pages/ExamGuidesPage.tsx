import React from 'react';
import { Keyboard, Clock, Calculator, CheckCircle2, AlertCircle, Bookmark } from 'lucide-react';
import { AdSenseAdUnit } from '../ads/AdSenseAdUnit';

export const ExamGuidesPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
          Examination Strategy & Technical Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight mt-3">
          JAMB 8-Key CBT Shortcuts & Examination Day Masterclass
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Master the official 8-key system, eliminate computer mouse fatigue, optimize your 120-minute time allocation, and understand how to leverage the on-screen scientific calculator.
        </p>
      </div>

      {/* 8-Key Shortcut System */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-950">
              The Official 8-Key CBT Keyboard Navigation
            </h2>
            <p className="text-xs text-slate-500">
              JAMB CBT workstations allow candidates to complete their entire 180 questions using strictly 8 keyboard letters without touching the mouse.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-center">
            <kbd className="px-3.5 py-1.5 bg-white border border-emerald-200 rounded-lg shadow-xs font-mono font-bold text-lg text-emerald-700">
              A
            </kbd>
            <div className="text-xs font-bold text-emerald-950 mt-2">
              Select Option A
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Picks first choice</div>
          </div>

          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-center">
            <kbd className="px-3.5 py-1.5 bg-white border border-emerald-200 rounded-lg shadow-xs font-mono font-bold text-lg text-emerald-700">
              B
            </kbd>
            <div className="text-xs font-bold text-emerald-950 mt-2">
              Select Option B
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Picks second choice</div>
          </div>

          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-center">
            <kbd className="px-3.5 py-1.5 bg-white border border-emerald-200 rounded-lg shadow-xs font-mono font-bold text-lg text-emerald-700">
              C
            </kbd>
            <div className="text-xs font-bold text-emerald-950 mt-2">
              Select Option C
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Picks third choice</div>
          </div>

          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-center">
            <kbd className="px-3.5 py-1.5 bg-white border border-emerald-200 rounded-lg shadow-xs font-mono font-bold text-lg text-emerald-700">
              D
            </kbd>
            <div className="text-xs font-bold text-emerald-950 mt-2">
              Select Option D
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Picks fourth choice</div>
          </div>

          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-center">
            <kbd className="px-3.5 py-1.5 bg-white border border-emerald-200 rounded-lg shadow-xs font-mono font-bold text-lg text-emerald-700">
              N
            </kbd>
            <div className="text-xs font-bold text-emerald-950 mt-2">
              Next Question
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Advance to next item</div>
          </div>

          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-center">
            <kbd className="px-3.5 py-1.5 bg-white border border-emerald-200 rounded-lg shadow-xs font-mono font-bold text-lg text-emerald-700">
              P
            </kbd>
            <div className="text-xs font-bold text-emerald-950 mt-2">
              Previous Question
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Return to previous item</div>
          </div>

          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-center">
            <kbd className="px-3.5 py-1.5 bg-white border border-emerald-200 rounded-lg shadow-xs font-mono font-bold text-lg text-emerald-700">
              S
            </kbd>
            <div className="text-xs font-bold text-emerald-950 mt-2">
              Submit Exam
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Triggers confirm modal</div>
          </div>

          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-center">
            <kbd className="px-3.5 py-1.5 bg-white border border-emerald-200 rounded-lg shadow-xs font-mono font-bold text-lg text-emerald-700">
              R
            </kbd>
            <div className="text-xs font-bold text-emerald-950 mt-2">
              Return / Cancel
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dismisses submit modal</div>
          </div>
        </div>
      </div>

      {/* Time Allocation Strategy */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-emerald-950">
              Optimized 120-Minute Time Budgeting Protocol
            </h2>
            <p className="text-xs text-slate-500">
              Candidates have 2 hours to answer 180 questions (60 in English and 40 each in 3 other subjects).
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                Phase 1: Speed Run on Non-Calculation Subjects (First 35 Minutes)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Start with biology, government, literature, or direct grammar questions. These require rapid recall rather than long algebraic computations. Budget approximately 25-30 seconds per factual question.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-100 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                Phase 2: Comprehensive English Passage Reading (Next 35 Minutes)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tackle the reading comprehension and cloze tests. Carefully parse the required compulsory novel passages. Never rush comprehension — reading once thoroughly saves minutes of frantic re-reading.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-100 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                Phase 3: Quantitative Solved Calculation Sections (Next 35 Minutes)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Work through mathematics, physics, and chemistry stoichiometry. Use rough sheets methodically. If any single calculation exceeds 90 seconds, flag it and move on!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-100 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm">
              4
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                Phase 4: Flagged Questions & Review (Final 15 Minutes)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Never leave an unanswered question in JAMB UTME since negative marking does not apply. Review all starred items using process of elimination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
