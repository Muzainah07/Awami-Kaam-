import React, { useState } from 'react';
import {
  Mic,
  Briefcase,
  Smartphone,
  Map as MapIcon,
  BarChart3,
  Globe,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { LanguageCode, LanguageOption } from '../types';
import { LANGUAGES } from '../data/seed';

interface NavbarProps {
  currentTab: 'worker' | 'hirer' | 'demo' | 'map' | 'impact';
  onTabChange: (tab: 'worker' | 'hirer' | 'demo' | 'map' | 'impact') => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onResetDemo: () => void;
  onOpenReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentLanguage,
  onLanguageChange,
  onResetDemo,
  onOpenReport,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => onTabChange('worker')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#0B6B3A] to-[#064223] text-white flex items-center justify-center font-bold shadow-md shadow-[#0B6B3A]/25 relative overflow-hidden">
              <span className="text-xl">🌙</span>
              <span className="absolute bottom-1 right-1 text-[10px] text-amber-300">★</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-gray-900 tracking-tight font-urdu">
                  عوامی کام
                </span>
                <span className="font-black text-sm text-[#0B6B3A] tracking-tight">
                  Awami Kam
                </span>
              </div>
              <span className="text-[10px] text-gray-500 hidden sm:block">
                AI Voice Daily-Wage Marketplace
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto max-w-[550px]">
            <button
              onClick={() => onTabChange('worker')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                currentTab === 'worker'
                  ? 'bg-[#0B6B3A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="font-urdu">مزدور (Worker)</span>
            </button>

            <button
              onClick={() => onTabChange('hirer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                currentTab === 'hirer'
                  ? 'bg-[#0B6B3A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="font-urdu">مالک (Hirer)</span>
            </button>

            <button
              onClick={() => onTabChange('demo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                currentTab === 'demo'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Demo Split</span>
            </button>

            <button
              onClick={() => onTabChange('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                currentTab === 'map'
                  ? 'bg-[#0B6B3A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>

            <button
              onClick={() => onTabChange('impact')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                currentTab === 'impact'
                  ? 'bg-[#0B6B3A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Impact</span>
            </button>
          </nav>

          {/* Right actions: Language Chips & Reset Demo */}
          <div className="flex items-center gap-2">
            {/* Flag-free Language Switcher Chips */}
            <div className="hidden md:flex items-center gap-1 bg-gray-50 border border-gray-200/80 p-0.5 rounded-xl">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    currentLanguage === lang.code
                      ? 'bg-[#0B6B3A] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>

            {/* Reset Demo / Seed data button */}
            <button
              onClick={onResetDemo}
              className="p-2 text-gray-500 hover:text-[#0B6B3A] rounded-xl hover:bg-gray-100 transition-all"
              title="Reset Seed Demo Data (25 Workers, 8 Jobs)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Privacy / Report */}
            <button
              onClick={onOpenReport}
              className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all"
              title="Report suspicious behavior / privacy"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
