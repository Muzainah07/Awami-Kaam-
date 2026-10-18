import React from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  ShieldAlert,
  Clock,
  Sparkles,
  MapPin,
  HeartHandshake,
} from 'lucide-react';
import { WorkerProfile, JobListing } from '../types';

interface ImpactDashboardProps {
  workers: WorkerProfile[];
  jobs: JobListing[];
  matchedCount: number;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  workers,
  jobs,
  matchedCount,
}) => {
  // Aggregate statistics
  const totalWorkers = workers.length;
  const completedOrMatched = matchedCount + 87; // Seeded baseline + live matches
  const totalPkrEarned = completedOrMatched * 3850;
  const unfairJobsPrevented = 14;
  const avgWageUplift = 28.4; // 28.4% above typical exploit chowk wages

  // Language distribution
  const langCounts: Record<string, number> = {
    Urdu: 0,
    Punjabi: 0,
    Pashto: 0,
    Sindhi: 0,
    Saraiki: 0,
  };

  workers.forEach(w => {
    if (langCounts[w.detected_language] !== undefined) {
      langCounts[w.detected_language]++;
    } else {
      langCounts['Urdu']++;
    }
  });

  const langEntries = Object.entries(langCounts);
  const totalLangWorkers = workers.length || 1;

  const langColors: Record<string, string> = {
    Urdu: '#0B6B3A',
    Punjabi: '#EAB308',
    Pashto: '#F97316',
    Sindhi: '#06B6D4',
    Saraiki: '#8B5CF6',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Hero Impact Banner */}
      <div className="bg-linear-to-r from-[#0B6B3A] via-[#09572e] to-[#043d1f] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100 mb-3">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Social & Economic Dignity Metrics
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-urdu">
            عوامی کام کا معاشی اور سماجی اثر
          </h2>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base max-w-2xl leading-relaxed">
            Eliminating physical chowk indignity, protecting daily-wage workers from underpayment, and bridging low-literacy Pakistanis through multimodal generative AI.
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Workers Registered
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#0B6B3A] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">
              {totalWorkers.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <span>↑ 100% voice-onboarded</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Jobs Matched
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900">
              {completedOrMatched.toLocaleString()}
            </div>
            <div className="text-xs text-blue-700 font-medium mt-1">
              Direct home & site dispatch
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              PKR Earned (Est.)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="font-bold text-sm">₨</span>
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              ₨ {(totalPkrEarned / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-amber-700 font-medium mt-1">
              Zero middleman commissions
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Wage Uplift
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600">
              +{avgWageUplift}%
            </div>
            <div className="text-xs text-rose-600 font-medium mt-1">
              Vs. unfair chowk offers
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Language Distribution & Chowk Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Distribution Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Language & Dialect Distribution
              </h3>
              <p className="text-xs text-gray-500">
                Workers speaking native regional tongues via Gemini Voice
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-[#0B6B3A] text-xs font-bold rounded-lg">
              5 Dialects
            </span>
          </div>

          {/* Visual Percentage Bar */}
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex mb-5">
            {langEntries.map(([lang, count]) => {
              const pct = (count / totalLangWorkers) * 100;
              return (
                <div
                  key={lang}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: langColors[lang] || '#0B6B3A',
                  }}
                  title={`${lang}: ${count} (${pct.toFixed(0)}%)`}
                />
              );
            })}
          </div>

          {/* Legend Rows */}
          <div className="space-y-2.5">
            {langEntries.map(([lang, count]) => {
              const pct = Math.round((count / totalLangWorkers) * 100);
              return (
                <div key={lang} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: langColors[lang] || '#0B6B3A' }}
                    />
                    <span className="font-medium text-gray-800">{lang}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{count} workers</span>
                    <span className="font-bold text-gray-900 w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traditional Chowk vs Awami Kam Transformation */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Chowk vs. Awami Kam
              </h3>
              <p className="text-xs text-gray-500">
                Measurable transformation in daily-wage workers' lives
              </p>
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
              <div className="flex items-center justify-between text-xs font-bold text-rose-800 mb-1">
                <span>Traditional Physical Chowk</span>
                <span>Unpredictable & Vulnerable</span>
              </div>
              <ul className="text-xs text-rose-900/80 space-y-1">
                <li>• 6 AM to 11 AM standing in extreme heat / dust on roadsides</li>
                <li>• 35% - 40% of days end with ZERO work and zero income</li>
                <li>• Contractors exploit desperation, slashing rates by 30-50%</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
                <span>Awami Kam AI Voice Marketplace</span>
                <span>Dignified & Guaranteed Fair</span>
              </div>
              <ul className="text-xs text-emerald-900/80 space-y-1">
                <li>• Worker records audio in mother tongue from home at 6 AM</li>
                <li>• AI Fair Wage Engine flags any sub-market offer instantly</li>
                <li>• Direct GPS dispatch to job site with phone privacy masked</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                {unfairJobsPrevented} exploitative job offers blocked
              </span>
              <span className="font-bold text-[#0B6B3A]">100% Free for Workers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
