/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { ExamSessionConfig, ExamAttempt, Question, Subject, Article } from './types';
import {
  prepareExamQuestions,
  getSubjects,
  getAllQuestionsFromStorage,
} from './services/cbtService';
import { INITIAL_ARTICLES } from './data/initialArticles';

// Navigation Components
import { SidebarNav, type NavRoute } from './components/navigation/SidebarNav';
import { TopHeader } from './components/navigation/TopHeader';

// Pages & Screens
import { DashboardHome } from './components/pages/DashboardHome';
import { PracticeDashboard } from './components/dashboard/PracticeDashboard';
import { CbtExamScreen } from './components/cbt/CbtExamScreen';
import { ExamResultScreen } from './components/cbt/ExamResultScreen';
import { ExamReviewScreen } from './components/cbt/ExamReviewScreen';
import { StudyMaterialsHubPage } from './components/pages/StudyMaterialsHubPage';
import { StudyMaterialDetailPage } from './components/pages/StudyMaterialDetailPage';
import { ExamGuidesPage } from './components/pages/ExamGuidesPage';
import { LeaderboardPage } from './components/pages/LeaderboardPage';
import { AboutUsPage } from './components/pages/AboutUsPage';
import { ContactUsPage } from './components/pages/ContactUsPage';
import { PrivacyPolicyPage, TermsOfServicePage, DisclaimerPage } from './components/pages/LegalPages';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HistoryModal } from './components/dashboard/HistoryModal';

interface PreparedQuestionItem {
  question: Question;
  displayOptions: string[];
  originalIndicesMap: number[];
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('dashboard');
  const [subRouteParam, setSubRouteParam] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [questionCount, setQuestionCount] = useState<number>(0);

  // Candidate and Exam State
  const [username, setUsername] = useState<string>('Teramayo');
  const [activeAttemptId, setActiveAttemptId] = useState<string>('');
  const [examMode, setExamMode] = useState<'practice' | 'timed' | 'simulation'>('practice');
  const [examQuestions, setExamQuestions] = useState<PreparedQuestionItem[]>([]);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(7200);
  const [lastSessionConfig, setLastSessionConfig] = useState<ExamSessionConfig | null>(null);
  const [completedAttempt, setCompletedAttempt] = useState<ExamAttempt | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load and refresh data from backend with aggressive cache-busting
  const loadData = async () => {
    try {
      const [subjList, allQ] = await Promise.all([
        getSubjects(),
        getAllQuestionsFromStorage(),
      ]);
      setSubjects(subjList);
      setQuestionCount(allQ.length);

      // Fetch articles from backend with unique cache-busting timestamp
      try {
        const res = await fetch(`/api/articles?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.articles) && data.articles.length > 0) {
            setArticles(data.articles);
          }
        }
      } catch (e) {
        console.warn('Articles fetch warning:', e);
      }
    } catch (err) {
      console.warn('Initial data loading warning:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh articles when window gains focus or user returns to tab
    const handleFocus = () => {
      loadData();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Also refresh when navigating to study materials
  useEffect(() => {
    if (currentRoute === 'study-materials') {
      loadData();
    }
  }, [currentRoute]);

  // Clean HTML5 URL Router Sync (Eliminating '#' for Google AdSense & SEO Compliance)
  const syncRouteFromUrl = () => {
    // 1. If user entered with a legacy '#' hash, extract and migrate to clean pathname
    let rawPath = window.location.pathname;
    const rawHash = window.location.hash.replace(/^#\/?/, '');

    if (rawHash) {
      rawPath = `/${rawHash}`;
      // Clean up browser URL bar immediately (removing '#' fragment)
      window.history.replaceState(null, '', rawPath);
    }

    const segments = rawPath.split('/').filter(Boolean);

    if (segments.length === 0 || segments[0] === 'dashboard') {
      setCurrentRoute('dashboard');
      setSubRouteParam('');
      document.title = 'CBT Quiz – 2027 JAMB UTME Practice & Study Hub';
      return;
    }

    const root = segments[0] as string;
    const param = segments.slice(1).join('/') || '';

    switch (root) {
      case 'take-quiz':
        setCurrentRoute('take-quiz');
        setSubRouteParam(param);
        document.title = param === 'active'
          ? 'Live CBT Exam Workstation – CBT Quiz'
          : param === 'results'
          ? 'CBT Exam Result Slip – CBT Quiz'
          : 'Take Quiz – JAMB UTME CBT Practice Simulator';
        break;
      case 'subjects':
        // Subject section redirected cleanly to study-materials
        window.history.replaceState(null, '', '/study-materials');
        setCurrentRoute('study-materials');
        setSubRouteParam('');
        break;
      case 'study-materials':
        setCurrentRoute('study-materials');
        setSubRouteParam(param);
        document.title = param
          ? `Study Guide: ${param.replace(/-/g, ' ')} – CBT Quiz`
          : 'Modular Chapter Study Materials – CBT Quiz';
        break;
      case 'exam-guides':
        setCurrentRoute('exam-guides');
        document.title = 'JAMB 8-Key CBT Shortcuts & Strategy – CBT Quiz';
        break;
      case 'leaderboard':
        setCurrentRoute('leaderboard');
        document.title = 'National Mock Exam Leaderboard – CBT Quiz';
        break;
      case 'about':
        setCurrentRoute('about');
        document.title = 'About Us – Teramayo Educational Services';
        break;
      case 'contact':
        setCurrentRoute('contact');
        document.title = 'Contact Support – Teramayo CBT Quiz';
        break;
      case 'privacy':
        setCurrentRoute('privacy');
        document.title = 'Privacy Policy & AdSense Disclosure – CBT Quiz';
        break;
      case 'terms':
        setCurrentRoute('terms');
        document.title = 'Terms of Service – CBT Quiz';
        break;
      case 'disclaimer':
        setCurrentRoute('disclaimer');
        document.title = 'Official Trademark Disclaimer – CBT Quiz';
        break;
      case 'admin':
        setCurrentRoute('admin');
        document.title = 'Private Question & Content Studio – Admin Portal';
        break;
      case 'results':
        setCurrentRoute('results');
        document.title = 'Examination History & Results – CBT Quiz';
        break;
      default:
        setCurrentRoute('dashboard');
        setSubRouteParam('');
        document.title = 'CBT Quiz – 2027 JAMB UTME Practice & Study Hub';
        break;
    }
  };

  useEffect(() => {
    syncRouteFromUrl();
    window.addEventListener('popstate', syncRouteFromUrl);
    window.addEventListener('hashchange', syncRouteFromUrl);
    return () => {
      window.removeEventListener('popstate', syncRouteFromUrl);
      window.removeEventListener('hashchange', syncRouteFromUrl);
    };
  }, []);

  const navigateTo = (route: NavRoute, param?: string) => {
    const cleanPath = route === 'dashboard' && !param
      ? '/'
      : param
      ? `/${route}/${param}`
      : `/${route}`;

    window.history.pushState(null, '', cleanPath);
    syncRouteFromUrl();
  };

  // Launch Exam Runner
  const handleStartExam = async (config: ExamSessionConfig) => {
    setLastSessionConfig(config);
    setUsername(config.username || 'Candidate');
    setExamMode(config.mode);
    setTotalTimeSeconds(config.totalTimeSeconds);

    const questions = await prepareExamQuestions(
      config.subjects,
      config.shuffleQuestions,
      config.shuffleOptions
    );

    setExamQuestions(questions);
    const newAttemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setActiveAttemptId(newAttemptId);
    navigateTo('take-quiz', 'active');
  };

  const handleFinishExam = (attempt: ExamAttempt) => {
    setCompletedAttempt(attempt);
    navigateTo('take-quiz', 'results');
  };

  const handleRetakeExam = () => {
    if (lastSessionConfig) {
      handleStartExam(lastSessionConfig);
    } else {
      navigateTo('take-quiz');
    }
  };

  const isExamActive = currentRoute === 'take-quiz' && subRouteParam.startsWith('active') && examQuestions.length > 0;
  const isResultActive = currentRoute === 'take-quiz' && subRouteParam.startsWith('results') && completedAttempt;
  const isReviewActive = currentRoute === 'take-quiz' && subRouteParam.startsWith('review') && completedAttempt;

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-800">
      {/* 1. PERSISTENT LEFT SIDEBAR NAVIGATION */}
      <SidebarNav
        currentRoute={currentRoute}
        onNavigate={(r) => navigateTo(r)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Top Header Bar (No visible public Add Content button) */}
        <TopHeader
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          currentRoute={currentRoute}
          routeTitle={
            currentRoute === 'dashboard'
              ? 'Dashboard'
              : currentRoute === 'take-quiz'
              ? 'Take Quiz'
              : currentRoute === 'study-materials'
              ? 'Study Materials'
              : currentRoute === 'leaderboard'
              ? 'Leaderboard'
              : currentRoute === 'about'
              ? 'About'
              : currentRoute === 'contact'
              ? 'Contact'
              : currentRoute
          }
        />

        {/* Content Body */}
        <main className="flex-1">
          {/* DASHBOARD HOME */}
          {currentRoute === 'dashboard' && (
            <DashboardHome
              onStartQuiz={() => navigateTo('take-quiz')}
              onNavigateToStudyMaterials={() => navigateTo('study-materials')}
              onNavigateToLeaderboard={() => navigateTo('leaderboard')}
              onSelectArticle={(slug) => navigateTo('study-materials', slug)}
              articles={articles}
              questionCount={questionCount}
            />
          )}

          {/* TAKE QUIZ (GATED WORKSTATION & PRACTICE DASHBOARD) */}
          {currentRoute === 'take-quiz' && (
            <>
              {isExamActive ? (
                <CbtExamScreen
                  attemptId={activeAttemptId}
                  username={username}
                  mode={examMode}
                  questions={examQuestions}
                  totalTimeSeconds={totalTimeSeconds}
                  onFinishExam={handleFinishExam}
                  onExitExam={() => {
                    if (confirm('Are you sure you want to exit the exam?')) {
                      navigateTo('take-quiz');
                    }
                  }}
                />
              ) : isResultActive ? (
                <ExamResultScreen
                  attempt={completedAttempt}
                  onReviewAnswers={() => {
                    navigateTo('take-quiz', 'review');
                    window.scrollTo(0, 0);
                  }}
                  onRetakeExam={handleRetakeExam}
                  onBackToDashboard={() => navigateTo('take-quiz')}
                />
              ) : isReviewActive ? (
                <ExamReviewScreen
                  attempt={completedAttempt}
                  onBackToResult={() => navigateTo('take-quiz', 'results')}
                  onBackToDashboard={() => navigateTo('take-quiz')}
                />
              ) : (
                <PracticeDashboard
                  onStartExam={handleStartExam}
                  onOpenHistory={() => setIsHistoryOpen(true)}
                  onOpenAdmin={() => navigateTo('admin')}
                  initialUsername={username}
                />
              )}
            </>
          )}

          {/* STUDY MATERIALS HUB & MODULAR CHAPTER DETAIL (/study-materials & /study-materials/:slug/chapter/:num) */}
          {currentRoute === 'study-materials' && (
            <>
              {subRouteParam ? (
                (() => {
                  const cleanParam = subRouteParam.replace(/^\/+|\/+$/g, '');
                  const parts = cleanParam.split('/');
                  const slugCandidate = (parts[0] || '').toLowerCase().trim();

                  let targetChapterIndex = 0;
                  const chPos = parts.indexOf('chapter');
                  if (chPos >= 0 && parts[chPos + 1]) {
                    const parsed = parseInt(parts[chPos + 1], 10);
                    if (!isNaN(parsed) && parsed > 0) targetChapterIndex = parsed - 1;
                  } else if (parts.length >= 2 && /^\d+$/.test(parts[1])) {
                    const parsed = parseInt(parts[1], 10);
                    if (!isNaN(parsed) && parsed > 0) targetChapterIndex = parsed - 1;
                  }

                  // Match article by exact slug, ID, or subject-specific keywords
                  const matched =
                    articles.find((a) => a.slug.toLowerCase() === slugCandidate) ||
                    articles.find((a) => a.id.toLowerCase() === slugCandidate) ||
                    (slugCandidate.includes('english') || slugCandidate.includes('lexis') || slugCandidate.includes('concord')
                      ? articles.find((a) => a.subjectId === 'english')
                      : undefined) ||
                    (slugCandidate.includes('math') || slugCandidate.includes('calculus')
                      ? articles.find((a) => a.subjectId === 'mathematics')
                      : undefined) ||
                    (slugCandidate.includes('physic') || slugCandidate.includes('motion') || slugCandidate.includes('newton')
                      ? articles.find((a) => a.subjectId === 'physics')
                      : undefined) ||
                    (slugCandidate.includes('chem') || slugCandidate.includes('equilibrium') || slugCandidate.includes('le-chatelier')
                      ? articles.find((a) => a.subjectId === 'chemistry')
                      : undefined) ||
                    articles.find((a) => a.slug.toLowerCase().includes(slugCandidate) || slugCandidate.includes(a.slug.toLowerCase())) ||
                    articles[0];

                  if (matched) {
                    return (
                      <StudyMaterialDetailPage
                        key={`${matched.slug}-${targetChapterIndex}`}
                        article={matched}
                        initialChapterIndex={targetChapterIndex}
                        onBack={() => navigateTo('study-materials')}
                        onTakeQuiz={() => navigateTo('take-quiz')}
                      />
                    );
                  }
                  return (
                    <StudyMaterialsHubPage
                      articles={articles}
                      onSelectArticle={(slug) => navigateTo('study-materials', slug)}
                    />
                  );
                })()
              ) : (
                <StudyMaterialsHubPage
                  articles={articles}
                  onSelectArticle={(slug) => navigateTo('study-materials', slug)}
                />
              )}
            </>
          )}

          {/* EXAM GUIDES (#/exam-guides) */}
          {currentRoute === 'exam-guides' && <ExamGuidesPage />}

          {/* LEADERBOARD (#/leaderboard) */}
          {currentRoute === 'leaderboard' && (
            <LeaderboardPage onStartQuiz={() => navigateTo('take-quiz')} />
          )}

          {/* RESULTS HISTORY MODAL OR PAGE (#/results) */}
          {currentRoute === 'results' && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 bg-white">
              <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-xs">
                <h1 className="text-2xl font-bold text-emerald-950 mb-2">
                  My Results & Exam Attempts History
                </h1>
                <p className="text-xs text-slate-500 mb-6">
                  Review your past scores, timing performance, and answer breakdowns.
                </p>
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Open Examination History Records
                </button>
              </div>
            </div>
          )}

          {/* ABOUT US (#/about) */}
          {currentRoute === 'about' && <AboutUsPage />}

          {/* CONTACT US (#/contact) */}
          {currentRoute === 'contact' && <ContactUsPage />}

          {/* PRIVACY POLICY (#/privacy) */}
          {currentRoute === 'privacy' && (
            <PrivacyPolicyPage onBack={() => navigateTo('dashboard')} />
          )}

          {/* TERMS OF SERVICE (#/terms) */}
          {currentRoute === 'terms' && (
            <TermsOfServicePage onBack={() => navigateTo('dashboard')} />
          )}

          {/* DISCLAIMER (#/disclaimer) */}
          {currentRoute === 'disclaimer' && (
            <DisclaimerPage onBack={() => navigateTo('dashboard')} />
          )}

          {/* QUESTION & CONTENT BANK ADMIN (#/admin) - Hidden from regular users */}
          {currentRoute === 'admin' && (
            <AdminDashboard onBackToApp={() => navigateTo('dashboard')} />
          )}
        </main>

        {/* Global Footer (AdSense Compliant) */}
        <footer className="mt-auto border-t border-emerald-100 bg-white px-4 sm:px-8 py-8 text-xs text-slate-600">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-extrabold text-emerald-950">
                CBT Quiz · Teramayo ICT Educational Services
              </div>
              <div className="text-[11px] text-emerald-800/80 mt-0.5">
                Practice • Improve • Excel · Contact:{' '}
                <a
                  href="mailto:teramayoict@gmail.com"
                  className="text-emerald-700 font-bold hover:underline"
                >
                  teramayoict@gmail.com
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => navigateTo('about')}
                className="hover:text-emerald-700 transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => navigateTo('contact')}
                className="hover:text-emerald-700 transition-colors"
              >
                Contact Support
              </button>
              <button
                onClick={() => navigateTo('privacy')}
                className="hover:text-emerald-700 transition-colors"
              >
                Privacy & Cookies
              </button>
              <button
                onClick={() => navigateTo('terms')}
                className="hover:text-emerald-700 transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => navigateTo('disclaimer')}
                className="hover:text-emerald-700 transition-colors"
              >
                Disclaimer
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        username={username}
        onSelectAttemptForReview={(attempt) => {
          setCompletedAttempt(attempt);
          setIsHistoryOpen(false);
          setCurrentRoute('take-quiz');
          setSubRouteParam('review');
        }}
      />
    </div>
  );
}
