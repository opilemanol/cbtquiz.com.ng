import React from 'react';
import {
  FileText,
  GraduationCap,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import type { Article } from '../../types';
import { AdSenseAdUnit } from '../ads/AdSenseAdUnit';

interface DashboardHomeProps {
  onStartQuiz: () => void;
  onNavigateToStudyMaterials: () => void;
  onNavigateToLeaderboard: () => void;
  onSelectArticle: (slug: string) => void;
  articles: Article[];
  questionCount: number;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onStartQuiz,
  onNavigateToStudyMaterials,
  onSelectArticle,
  articles,
  questionCount,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-white">
      {/* Welcome Hero Card: Dominant White with Emerald Accents */}
      <div className="relative overflow-hidden rounded-3xl bg-white text-slate-800 p-6 sm:p-10 shadow-xs border-2 border-emerald-500/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>2027 JAMB UTME Comprehensive Preparation & Study Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-emerald-950">
            Master Every Subject with Chapter-by-Chapter Study Guides & Realistic CBT Trials
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Read comprehensive, bite-sized subject chapters with rich scientific formulas, chemical equations, and step-by-step solved examples. No endless scrolling—navigate smoothly chapter by chapter!
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartQuiz}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Launch CBT Practice Quiz</span>
            </button>

            <button
              onClick={onNavigateToStudyMaterials}
              className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-600 font-bold rounded-xl text-sm transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Explore Study Materials</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle green radial pattern */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8 hidden md:flex">
          <div className="w-64 h-64 rounded-full border-8 border-emerald-400" />
        </div>
      </div>

      {/* Featured Subject Study Materials (with Chapters Count) */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              High-Yield Subject Study Materials & Chapters
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select a subject below to study modular chapters with clear Previous/Next navigation, formulas, and solved problems.
            </p>
          </div>

          <button
            onClick={onNavigateToStudyMaterials}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
          >
            <span>Browse All Materials</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => {
            const chapterCount = art.chapters?.length || 4;
            return (
              <div
                key={art.slug}
                onClick={() => onSelectArticle(art.slug)}
                className="p-6 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-bold text-emerald-800 uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {art.subjectName}
                    </span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded-md">
                      {chapterCount} Chapters
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors leading-snug mt-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-emerald-100 text-xs font-bold text-emerald-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Chapter 1 &rarr; Chapter {chapterCount}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 group-hover:translate-x-1 transition-transform">
                    Read Chapters <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
