import React from 'react';
import {
  Home,
  FileText,
  BarChart2,
  BookOpen,
  GraduationCap,
  Trophy,
  Layers
} from 'lucide-react';

export type NavRoute =
  | 'dashboard'
  | 'take-quiz'
  | 'results'
  | 'subjects'
  | 'study-materials'
  | 'leaderboard'
  | 'exam-guides'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'settings'
  | 'admin';

interface SidebarNavProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentRoute,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: Array<{
    route: NavRoute;
    label: string;
    icon: React.ReactNode;
  }> = [
    { route: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { route: 'take-quiz', label: 'Take Quiz', icon: <FileText className="w-5 h-5" /> },
    { route: 'results', label: 'My Results', icon: <BarChart2 className="w-5 h-5" /> },
    { route: 'study-materials', label: 'Study Materials', icon: <GraduationCap className="w-5 h-5" /> },
    { route: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-5 h-5" /> },
  ];

  const handleItemClick = (route: NavRoute) => {
    onNavigate(route);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-800 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-emerald-100/90 shadow-lg md:shadow-none`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-extrabold text-emerald-950 tracking-tight leading-none">
                CBT Quiz
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold tracking-wide mt-1">
                Practice • Improve • Excel
              </div>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto bg-white">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleItemClick(item.route)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                    : 'text-slate-700 hover:text-emerald-950 hover:bg-emerald-50/70'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-emerald-700'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-emerald-100 px-2">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2">
              Public Portal
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleItemClick('exam-guides')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentRoute === 'exam-guides'
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/50'
                }`}
              >
                Exam & Shortcut Guides
              </button>
              <button
                onClick={() => handleItemClick('about')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentRoute === 'about'
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/50'
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => handleItemClick('contact')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentRoute === 'contact'
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/50'
                }`}
              >
                Contact Support
              </button>
              <button
                onClick={() => handleItemClick('privacy')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentRoute === 'privacy'
                    ? 'text-emerald-700 bg-emerald-50 font-bold'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/50'
                }`}
              >
                Privacy & Ad Policy
              </button>
            </div>
          </div>
        </nav>

        {/* Editorial Content Footer */}
        <div className="p-4 border-t border-emerald-100/90 bg-emerald-50/40 text-center">
          <div className="text-xs font-bold text-emerald-950">
            Teramayo Educational Services
          </div>
          <div className="text-[11px] text-emerald-700/90 font-medium mt-0.5">
            2027 JAMB UTME Study & CBT Portal
          </div>
        </div>
      </aside>
    </>
  );
};
