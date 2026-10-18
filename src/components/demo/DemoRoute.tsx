import React, { useState, useEffect } from 'react';
import { WorkerApp } from '../worker/WorkerApp';
import { HirerApp } from '../hirer/HirerApp';
import { ImpactMetrics } from '../../types';
import { api } from '../../services/api';
import {
  Smartphone,
  BarChart3,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const DemoRoute: React.FC = () => {
  const [activeView, setActiveView] = useState<'split' | 'impact'>('split');
  const [impactStats, setImpactStats] = useState<ImpactMetrics | null>(null);
  const [setupStatus, setSetupStatus] = useState<{ workerOk: boolean; hirerOk: boolean; seedOk: boolean; details: string } | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    api.getImpactStats().then(stats => setImpactStats(stats));
    api.checkDemoSetup().then(status => setSetupStatus(status));
  }, [resetKey]);

  const handleReset = async () => {
    await api.resetDemoData();
    const status = await api.checkDemoSetup();
    setSetupStatus(status);
    setResetKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-[#F0F2ED] text-[#14201A] p-4 sm:p-6 font-sans">
      {/* Top Demo Bar */}
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-3xl p-4 shadow-sm border border-[#E4E8E2] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F2B705]/20 text-[#14201A] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#946800]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-urdu font-black text-lg">عوامی کام</span>
              <span className="font-black text-sm text-[#0B6B3A]">
                Awami Kam • Developer Demo Hub (/demo)
              </span>
            </div>
            <p className="text-xs text-[#6B7A72]">
              Two independent apps simulated side-by-side with shared state
            </p>
          </div>
        </div>

        {/* View Switcher & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F7F8F5] p-1 rounded-2xl border border-[#E4E8E2]">
            <button
              onClick={() => setActiveView('split')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'split'
                  ? 'bg-[#0B6B3A] text-white shadow-xs'
                  : 'text-[#6B7A72] hover:text-[#14201A]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Split Apps</span>
            </button>
            <button
              onClick={() => setActiveView('impact')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'impact'
                  ? 'bg-[#0B6B3A] text-white shadow-xs'
                  : 'text-[#6B7A72] hover:text-[#14201A]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Impact Dashboard</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-white border border-[#E4E8E2] hover:bg-gray-100 text-[#6B7A72] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Reset Mock Data"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Setup Checklist Banner */}
      {setupStatus && (
        <div className="max-w-7xl mx-auto mb-6 bg-white rounded-2xl p-3 px-4 shadow-xs border border-[#E4E8E2] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-[#14201A]">Setup Checklist:</span>
            <div className="flex items-center gap-1.5">
              {setupStatus.workerOk ? <CheckCircle2 className="w-4 h-4 text-[#1F9D55]" /> : <XCircle className="w-4 h-4 text-[#D64545]" />}
              <span>Worker Demo User ({setupStatus.workerOk ? 'OK' : 'Missing'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              {setupStatus.hirerOk ? <CheckCircle2 className="w-4 h-4 text-[#1F9D55]" /> : <XCircle className="w-4 h-4 text-[#D64545]" />}
              <span>Hirer Demo User ({setupStatus.hirerOk ? 'OK' : 'Missing'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              {setupStatus.seedOk ? <CheckCircle2 className="w-4 h-4 text-[#1F9D55]" /> : <XCircle className="w-4 h-4 text-[#D64545]" />}
              <span>Seed Data ({setupStatus.seedOk ? 'OK' : 'Missing'})</span>
            </div>
          </div>
          <span className="text-[#6B7A72] text-[11px]">{setupStatus.details}</span>
        </div>
      )}

      {/* VIEW 1: Split Screen */}
      {activeView === 'split' && (
        <div key={resetKey} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in">
          {/* Left: Worker Mobile Phone */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B6B3A] uppercase tracking-wider mb-2">
              <Smartphone className="w-4 h-4" />
              <span>Worker App (/worker) • Driver Equivalent</span>
            </div>

            {/* Mobile frame */}
            <div className="w-full max-w-[390px] bg-gray-900 rounded-[52px] p-3 shadow-2xl border-4 border-gray-800 relative">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-gray-900 rounded-full z-40" />
              <div className="w-full h-[760px] bg-[#F7F8F5] rounded-[42px] overflow-y-auto overflow-x-hidden relative flex flex-col">
                <WorkerApp
                  onLogout={handleReset}
                  onSwitchAccount={() => {}}
                />
              </div>
            </div>
          </div>

          {/* Right: Hirer Mobile Phone */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[#14201A] uppercase tracking-wider mb-2">
              <Smartphone className="w-4 h-4" />
              <span>Hirer App (/hirer) • Rider Equivalent</span>
            </div>

            {/* Mobile frame */}
            <div className="w-full max-w-[390px] bg-gray-900 rounded-[52px] p-3 shadow-2xl border-4 border-gray-800 relative">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-gray-900 rounded-full z-40" />
              <div className="w-full h-[760px] bg-[#F7F8F5] rounded-[42px] overflow-y-auto overflow-x-hidden relative flex flex-col">
                <HirerApp
                  onLogout={handleReset}
                  onSwitchAccount={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Impact & Analytics Dashboard (Kept exclusively in /demo) */}
      {activeView === 'impact' && impactStats && (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
          {/* Banner */}
          <div className="bg-[#0B6B3A] text-white rounded-3xl p-6 sm:p-8 shadow-md">
            <span className="text-xs font-bold px-3 py-1 bg-white/20 rounded-full">
              Social Impact & Chowk Dignity Metrics
            </span>
            <h2 className="text-3xl font-extrabold font-urdu mt-3">
              عوامی کام کا معاشی اور سماجی اثر
            </h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Eliminating physical chowk indignity, protecting daily-wage workers from underpayment, and bridging low-literacy Pakistanis through voice AI.
            </p>
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E4E8E2] shadow-xs">
              <span className="text-xs font-bold text-[#6B7A72] block">Workers Registered</span>
              <div className="text-3xl font-black text-[#14201A] mt-1">
                {impactStats.workersRegistered.toLocaleString()}
              </div>
              <span className="text-xs text-[#0B6B3A] font-bold mt-1 block">100% Voice Onboarded</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E4E8E2] shadow-xs">
              <span className="text-xs font-bold text-[#6B7A72] block">Jobs Dispatched</span>
              <div className="text-3xl font-black text-[#14201A] mt-1">
                {impactStats.jobsMatched.toLocaleString()}
              </div>
              <span className="text-xs text-[#6B7A72] font-semibold mt-1 block">Direct Site Dispatch</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E4E8E2] shadow-xs">
              <span className="text-xs font-bold text-[#6B7A72] block">PKR Earned (Total)</span>
              <div className="text-3xl font-black text-[#0B6B3A] mt-1">
                ₨ {(impactStats.totalPkrEarned / 1000000).toFixed(1)}M
              </div>
              <span className="text-xs text-[#0B6B3A] font-semibold mt-1 block">Zero Commission</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E4E8E2] shadow-xs">
              <span className="text-xs font-bold text-[#6B7A72] block">Wage Uplift</span>
              <div className="text-3xl font-black text-[#0B6B3A] mt-1">
                +{impactStats.wageUpliftPercent}%
              </div>
              <span className="text-xs text-[#6B7A72] font-semibold mt-1 block">Vs Roadside Chowk</span>
            </div>
          </div>

          {/* Language Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-[#E4E8E2]">
            <h3 className="font-bold text-base text-[#14201A] mb-4">
              Regional Language & Dialect Adoption
            </h3>
            <div className="space-y-3">
              {Object.entries(impactStats.languageDistribution).map(([lang, pct]) => (
                <div key={lang}>
                  <div className="flex justify-between text-xs font-bold text-[#14201A] mb-1">
                    <span>{lang}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0B6B3A] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
