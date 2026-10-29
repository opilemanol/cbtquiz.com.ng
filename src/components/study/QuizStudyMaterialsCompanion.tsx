import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Clock,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import type { Article, ArticleChapter } from '../../types';
import { INITIAL_ARTICLES } from '../../data/initialArticles';
import { ScientificHtmlRenderer } from '../common/ScientificHtmlRenderer';

interface QuizStudyMaterialsCompanionProps {
  activeSubjectId?: string;
  onOpenFullStudyHub?: () => void;
}

export const QuizStudyMaterialsCompanion: React.FC<QuizStudyMaterialsCompanionProps> = ({
  activeSubjectId = 'english',
  onOpenFullStudyHub,
}) => {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [isOpen, setIsOpen] = useState<boolean>(true); // Open by default for rich crawlable content
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(activeSubjectId);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  // Fetch live articles if updated
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveArticles() {
      try {
        const res = await fetch(`/api/articles?_t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.articles) && data.articles.length > 0) {
            setArticles(data.articles);
          }
        }
      } catch {
        // fallback to INITIAL_ARTICLES
      }
    }
    fetchLiveArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update selected subject when activeSubjectId changes
  useEffect(() => {
    if (activeSubjectId) {
      setSelectedSubjectId(activeSubjectId);
      setCurrentChapterIndex(0);
    }
  }, [activeSubjectId]);

  // Find active article for the selected subject
  const currentArticle: Article | undefined = useMemo(() => {
    const cleanSubj = selectedSubjectId.toLowerCase().trim();
    return (
      articles.find((a) => a.subjectId.toLowerCase() === cleanSubj) ||
      articles.find((a) => a.subjectId.toLowerCase().includes(cleanSubj) || cleanSubj.includes(a.subjectId.toLowerCase())) ||
      articles[0]
    );
  }, [articles, selectedSubjectId]);

  // Extract chapters safely
  const chapters: ArticleChapter[] = useMemo(() => {
    if (!currentArticle) return [];
    if (currentArticle.chapters && currentArticle.chapters.length > 0) {
      return currentArticle.chapters;
    }
    return [
      {
        chapterNumber: 1,
        title: currentArticle.topicName || 'Chapter 1: Subject Masterclass',
        content: currentArticle.content || '',
        readTimeMinutes: currentArticle.readTimeMinutes || 10,
      },
    ];
  }, [currentArticle]);

  // Ensure chapter index is valid
  const safeChapterIndex = Math.min(currentChapterIndex, Math.max(0, chapters.length - 1));
  const activeChapter = chapters[safeChapterIndex] || chapters[0];

  return (
    <section aria-label="Curriculum Study Companion" className="w-full bg-white rounded-3xl border-2 border-emerald-500/25 p-5 sm:p-7 shadow-xs mt-8">
      {/* Companion Masthead & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>JAMB UTME Comprehensive Study Notes</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-emerald-950 mt-0.5">
              Study Materials & Revision Companion
            </h2>
            <p className="text-xs text-slate-600 hidden sm:block">
              Review syllabus rules, formulas, and chapter notes right below your exam workstation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFullStudyHub && (
            <button
              onClick={onOpenFullStudyHub}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 transition-colors"
            >
              <span>Full Study Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 transition-colors"
            aria-expanded={isOpen}
          >
            <span>{isOpen ? 'Minimize Notes' : 'Open Study Guide'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="pt-5 space-y-6">
          {/* Subject Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-500 shrink-0">Subject:</span>
            {articles.map((art) => {
              const isSelected = art.subjectId === selectedSubjectId || (currentArticle && currentArticle.id === art.id);
              return (
                <button
                  key={art.id}
                  onClick={() => {
                    setSelectedSubjectId(art.subjectId);
                    setCurrentChapterIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  {art.subjectName} ({art.chapters?.length || 1} Ch.)
                </button>
              );
            })}
          </div>

          {currentArticle && (
            <div>
              {/* Chapter Stepper Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 mb-6">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    {currentArticle.title}
                  </div>
                  <div className="text-sm font-extrabold text-emerald-950 mt-0.5">
                    Chapter {safeChapterIndex + 1} of {chapters.length}: {activeChapter?.title}
                  </div>
                </div>

                {/* Chapter Dropdown / Quick Select */}
                <div className="flex items-center gap-2">
                  <select
                    value={safeChapterIndex}
                    onChange={(e) => setCurrentChapterIndex(Number(e.target.value))}
                    className="text-xs font-bold bg-white text-emerald-950 border border-emerald-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  >
                    {chapters.map((ch, idx) => (
                      <option key={idx} value={idx}>
                        Ch. {ch.chapterNumber}: {ch.title.substring(0, 45)}...
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setCurrentChapterIndex((prev) => Math.max(0, prev - 1))}
                    disabled={safeChapterIndex === 0}
                    className="p-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                    title="Previous Chapter"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1))}
                    disabled={safeChapterIndex === chapters.length - 1}
                    className="p-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                    title="Next Chapter"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Render Chapter Content with Full Formulas & Explanations */}
              <article className="prose prose-emerald max-w-none bg-white p-6 rounded-2xl border border-emerald-100 text-slate-800 text-xs sm:text-sm leading-relaxed overflow-x-auto shadow-2xs">
                {activeChapter ? (
                  <ScientificHtmlRenderer content={activeChapter.content} />
                ) : (
                  <p className="text-slate-500">No content available for this chapter.</p>
                )}
              </article>

              {/* Chapter Bottom Navigation */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-emerald-100 text-xs">
                <button
                  onClick={() => setCurrentChapterIndex((prev) => Math.max(0, prev - 1))}
                  disabled={safeChapterIndex === 0}
                  className="font-bold text-emerald-800 hover:text-emerald-950 disabled:opacity-30 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Chapter</span>
                </button>

                <div className="font-semibold text-slate-500">
                  Chapter {safeChapterIndex + 1} / {chapters.length}
                </div>

                <button
                  onClick={() => setCurrentChapterIndex((prev) => Math.min(chapters.length - 1, prev + 1))}
                  disabled={safeChapterIndex === chapters.length - 1}
                  className="font-bold text-emerald-800 hover:text-emerald-950 disabled:opacity-30 flex items-center gap-1 transition-colors"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
