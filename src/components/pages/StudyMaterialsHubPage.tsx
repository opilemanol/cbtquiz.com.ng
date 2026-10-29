import React, { useState } from 'react';
import { Search, ArrowRight, BookOpen, Layers, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Article } from '../../types';
import { AdSenseAdUnit } from '../ads/AdSenseAdUnit';

interface StudyMaterialsHubPageProps {
  articles: Article[];
  onSelectArticle: (slug: string) => void;
}

export const StudyMaterialsHubPage: React.FC<StudyMaterialsHubPageProps> = ({
  articles,
  onSelectArticle,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const subjectsWithArticles = Array.from(
    new Set(articles.map((a) => a.subjectId))
  );

  const filteredArticles = articles.filter((a) => {
    const matchesSubject =
      selectedSubjectFilter === 'all' || a.subjectId === selectedSubjectFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.topicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Chapter-by-Chapter Learning Hub
              </span>
              <span className="text-xs text-emerald-700 font-semibold">Free Open Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
              JAMB UTME Modular Subject Study Materials
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl">
              Carefully structured into modular chapters so you never have to scroll an endless page. Navigate chapter by chapter with full scientific formulas, chemical equations, and step-by-step solutions.
            </p>
          </div>
        </div>

        {/* Search & Subject Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-emerald-600" />
            <input
              type="text"
              placeholder="Search subject, chapter, formula, or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                selectedSubjectFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              All Subjects ({articles.length})
            </button>
            {subjectsWithArticles.map((sId) => (
              <button
                key={sId}
                onClick={() => setSelectedSubjectFilter(sId)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap capitalize transition-colors ${
                  selectedSubjectFilter === sId
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {sId.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Study Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
        {filteredArticles.map((article) => {
          const chapterCount = article.chapters?.length || 4;

          return (
            <div
              key={article.slug}
              onClick={() => onSelectArticle(article.slug)}
              className="bg-white rounded-3xl border border-emerald-100 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="font-bold text-emerald-800 uppercase bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {article.subjectName}
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {chapterCount} Chapters
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Chapter Previews */}
                <div className="mt-4 pt-3 border-t border-emerald-100 space-y-1.5">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Chapter Modules:
                  </div>
                  {article.chapters && article.chapters.length > 0 ? (
                    article.chapters.slice(0, 3).map((ch) => (
                      <div
                        key={ch.chapterNumber}
                        className="text-xs text-slate-600 truncate flex items-center gap-1.5"
                      >
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {ch.chapterNumber}
                        </span>
                        <span className="truncate">{ch.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <span>Chapter 1: Foundational Concepts & Formulas</span>
                    </div>
                  )}
                  {chapterCount > 3 && (
                    <div className="text-[11px] text-emerald-700 font-semibold pl-5">
                      + {chapterCount - 3} more chapters...
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {article.readTimeMinutes} mins total
                </span>
                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Start Reading Chapter 1</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
