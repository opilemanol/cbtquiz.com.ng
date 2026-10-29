import React from 'react';
import { Menu } from 'lucide-react';
import type { NavRoute } from './SidebarNav';

interface TopHeaderProps {
  onToggleMobileMenu: () => void;
  currentRoute: NavRoute;
  routeTitle?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileMenu,
  currentRoute: _currentRoute,
  routeTitle,
}) => {
  return (
    <header className="h-16 bg-white border-b border-emerald-100/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 text-emerald-800 hover:text-emerald-950 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-emerald-950 leading-tight flex items-center gap-2">
            <span className="font-extrabold">CBT Quiz</span>
            {routeTitle && (
              <span className="text-xs font-semibold text-emerald-700/80 hidden sm:inline">
                / {routeTitle}
              </span>
            )}
          </h1>
          <p className="text-xs text-emerald-700 font-medium hidden sm:block">
            Your Exam Success Partner
          </p>
        </div>
      </div>

      {/* Right Actions: Clean Content Website Style */}
      <div className="flex items-center gap-2 sm:gap-3" />
    </header>
  );
};
