import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  Layers,
  Sparkles,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import type { Article, ArticleChapter } from '../../types';
import { AdSenseAdUnit } from '../ads/AdSenseAdUnit';
import { ScientificHtmlRenderer } from '../common/ScientificHtmlRenderer';
import { ChapterQuizWidget } from '../study/ChapterQuizWidget';

interface StudyMaterialDetailPageProps {
  article: Article;
  initialChapterIndex?: number;
  onBack: () => void;
  onTakeQuiz: (subjectId: string) => void;
}

export const StudyMaterialDetailPage: React.FC<StudyMaterialDetailPageProps> = ({
  article,
  initialChapterIndex = 0,
  onBack,
  onTakeQuiz,
}) => {
  // If article has explicit chapters, use them; otherwise, split content into modular chapters
  const chapters: ArticleChapter[] = useMemo(() => {
    if (article.chapters && article.chapters.length > 0) {
      return article.chapters;
    }

    // Fallback: Split raw content by major headings (# or <h2> or <h3> or ---) into bite-sized chapters
    const raw = article.content || '';
    const sections = raw.split(/(?=\n### |\n## |\n# |<h[123]>)/i).filter((s) => s.trim().length > 0);

    if (sections.length >= 2) {
      return sections.map((sec, idx) => {
        // Extract title from section
        const firstLine = sec.trim().split('\n')[0].replace(/[#<>]/g, '').trim();
        return {
          chapterNumber: idx + 1,
          title: firstLine || `Chapter ${idx + 1}: Key Principles`,
          content: sec.trim(),
          readTimeMinutes: Math.max(2, Math.round(article.readTimeMinutes / sections.length)),
        };
      });
    }

    // Default single chapter
    return [
      {
        chapterNumber: 1,
        title: article.topicName || 'Chapter 1: Comprehensive Study Guide',
        content: raw,
        readTimeMinutes: article.readTimeMinutes || 5,
      },
    ];
  }, [article]);

  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(() => {
    // 1. Check if URL path or hash specifies a chapter e.g. /study-materials/:slug/chapter/2
    const currentUrl = window.location.pathname + window.location.hash;
    const match = currentUrl.match(/\/chapter\/(\d+)/i);
    if (match) {
      const parsed = parseInt(match[1], 10) - 1;
      if (parsed >= 0 && parsed < chapters.length) return parsed;
    }
    // 2. Check initialChapterIndex prop
    if (typeof initialChapterIndex === 'number' && initialChapterIndex >= 0 && initialChapterIndex < chapters.length) {
      return initialChapterIndex;
    }
    return 0;
  });

  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state if initialChapterIndex prop changes or chapters load
  useEffect(() => {
    if (typeof initialChapterIndex === 'number' && initialChapterIndex >= 0 && initialChapterIndex < chapters.length) {
      setCurrentChapterIndex(initialChapterIndex);
    }
  }, [initialChapterIndex, chapters.length]);

  // Keep browser URL, document title and history synced with current chapter
  useEffect(() => {
    const ch = chapters[currentChapterIndex];
    if (ch) {
      document.title = `Ch. ${ch.chapterNumber}: ${ch.title} – ${article.title} – CBT Quiz`;
    }
    const cleanPath = `/study-materials/${article.slug}/chapter/${currentChapterIndex + 1}`;
    if (window.location.pathname !== cleanPath) {
      window.history.replaceState(null, '', cleanPath);
    }
  }, [currentChapterIndex, chapters, article.slug, article.title]);

  const currentChapter = chapters[currentChapterIndex] || chapters[0];
  const totalChapters = chapters.length;
  const progressPercent = Math.round(((currentChapterIndex + 1) / totalChapters) * 100);

  const goToChapter = (index: number) => {
    if (index >= 0 && index < totalChapters) {
      setCurrentChapterIndex(index);
      // Clean HTML5 URL for Google AdSense, WhatsApp sharing and SEO crawlers
      const cleanPath = `/study-materials/${article.slug}/chapter/${index + 1}`;
      window.history.pushState(null, '', cleanPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < totalChapters - 1) {
      goToChapter(currentChapterIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentChapterIndex > 0) {
      goToChapter(currentChapterIndex - 1);
    }
  };

  const handleShareChapter = async () => {
    const cleanUrl = `${window.location.origin}/study-materials/${article.slug}/chapter/${currentChapterIndex + 1}`;
    const shareTitle = `Chapter ${currentChapterIndex + 1}: ${currentChapter?.title || article.title}`;
    const shareText = `Read Chapter ${currentChapterIndex + 1} of "${article.title}" on Teramayo CBT Quiz:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: cleanUrl,
        });
        return;
      } catch {
        // If native share was dismissed or unsupported, proceed to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(cleanUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 bg-white text-slate-800">
      {/* Top Action Bar with Share Chapter and Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>Back to All Study Materials</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share / Copy Direct Chapter Link Button */}
          <button
            onClick={handleShareChapter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all shadow-2xs"
            title="Share or copy direct chapter URL for WhatsApp / Facebook"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-extrabold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Share Chapter {currentChapterIndex + 1}</span>
              </>
            )}
          </button>

          <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ch. {currentChapterIndex + 1} of {totalChapters}</span>
          </div>
        </div>
      </div>

      {/* Main Subject Header & Chapter Stepper Card */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
              {article.subjectName}
            </span>
            <span className="text-xs text-emerald-300">·</span>
            <span className="text-xs font-semibold text-emerald-800">
              {article.topicName}
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              {article.author}
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              ~{currentChapter.readTimeMinutes || 3} min read
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* Chapter Progress Bar */}
        <div className="mt-6 pt-5 border-t border-emerald-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-emerald-950">
              Chapter {currentChapterIndex + 1}: {currentChapter.title}
            </span>
            <span className="font-bold text-emerald-700">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="w-full h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Chapter Quick Selector Pills */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
            {chapters.map((ch, idx) => {
              const isActive = idx === currentChapterIndex;
              return (
                <button
                  key={ch.chapterNumber}
                  onClick={() => goToChapter(idx)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50/70 text-emerald-900 border border-emerald-200/60 hover:bg-emerald-100'
                  }`}
                >
                  <span>Ch. {ch.chapterNumber}</span>
                  {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-100" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Chapter Reading Box */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-10 shadow-xs mb-8">
        <div className="border-b border-emerald-100 pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
              Chapter {currentChapterIndex + 1} of {totalChapters}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 mt-1">
              {currentChapter.title}
            </h2>
          </div>

          <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            Modular Lesson
          </div>
        </div>

        {/* Render Chapter Content with Full Scientific HTML & KaTeX formulas */}
        <ScientificHtmlRenderer content={currentChapter.content} />
      </div>

      {/* Interactive In-Chapter Practice Quiz Widget (100% Free Public Access) */}
      <ChapterQuizWidget
        subjectId={article.subjectId}
        subjectName={article.subjectName}
        chapterNumber={currentChapter.chapterNumber}
        chapterTitle={currentChapter.title}
        onTakeFullQuiz={() => onTakeQuiz(article.subjectId)}
      />

      {/* Chapter Navigation Bar: Previous Chapter & Next Chapter Buttons */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/20 p-5 sm:p-6 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous Chapter Button */}
          <button
            onClick={handlePrev}
            disabled={currentChapterIndex === 0}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              currentChapterIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-white hover:bg-emerald-50 text-emerald-800 border-2 border-emerald-600 shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-semibold text-slate-500">
                Previous Chapter
              </div>
              <div className="truncate max-w-[200px]">
                {currentChapterIndex > 0
                  ? `Ch. ${chapters[currentChapterIndex - 1].chapterNumber}: ${chapters[currentChapterIndex - 1].title}`
                  : 'Start of Course'}
              </div>
            </div>
          </button>

          {/* Chapter Indicator */}
          <div className="text-xs font-bold text-emerald-950 text-center">
            Chapter {currentChapterIndex + 1} of {totalChapters}
          </div>

          {/* Next Chapter Button or Complete Course Action */}
          {currentChapterIndex < totalChapters - 1 ? (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-emerald-100">
                  Next Chapter
                </div>
                <div className="truncate max-w-[200px]">
                  Ch. {chapters[currentChapterIndex + 1].chapterNumber}: {chapters[currentChapterIndex + 1].title}
                </div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onTakeQuiz(article.subjectId)}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>All Chapters Done! Take Practice Quiz</span>
            </button>
          )}
        </div>
      </div>

      {/* Keywords & Tags */}
      {article.keywords && article.keywords.length > 0 && (
        <div className="bg-emerald-50/40 rounded-3xl p-5 border border-emerald-100 mb-8">
          <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2.5">
            Curriculum Keywords & Syllabus Tags:
          </div>
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white text-emerald-800 rounded-lg text-xs border border-emerald-200 font-semibold shadow-2xs"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Share Chapter Callout for candidates */}
      <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-emerald-950">
            Studying with classmates or friends?
          </h4>
          <p className="text-xs text-emerald-800/80 mt-0.5">
            Share this exact chapter link directly on WhatsApp, Facebook, or study groups.
          </p>
        </div>
        <button
          onClick={handleShareChapter}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share Chapter {currentChapterIndex + 1}</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
