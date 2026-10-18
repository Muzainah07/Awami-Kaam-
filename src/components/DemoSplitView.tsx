import React from 'react';
import { WorkerHome } from './WorkerHome';
import { HirerHome } from './HirerHome';
import { WorkerProfile, JobListing, JobOffer } from '../types';
import { Smartphone, Monitor, ArrowLeftRight, Sparkles } from 'lucide-react';

interface DemoSplitViewProps {
  workers: WorkerProfile[];
  currentWorker: WorkerProfile | null;
  onWorkerRegistered: (worker: WorkerProfile) => void;
  activeOffers: JobOffer[];
  onAcceptOffer: (offerId: string) => void;
  onDeclineOffer: (offerId: string) => void;
  onPostJobAndSendOffer: (job: JobListing, matchedWorker: WorkerProfile) => void;
  onRequestConsent: () => void;
  hasConsent: boolean;
  onRequestFeedback: (offer: JobOffer) => void;
}

export const DemoSplitView: React.FC<DemoSplitViewProps> = ({
  workers,
  currentWorker,
  onWorkerRegistered,
  activeOffers,
  onAcceptOffer,
  onDeclineOffer,
  onPostJobAndSendOffer,
  onRequestConsent,
  hasConsent,
  onRequestFeedback,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-6 space-y-4 animate-in fade-in duration-300">
      {/* Top Banner Explaining the Split Real-time Demo */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
              Awami Kam Real-Time Split Demo (Worker Phone ↔ Hirer Dashboard)
            </h3>
            <p className="text-xs text-gray-500">
              Post a job on the right → watch the Worker's phone on the left receive the voice offer live!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>In-Memory Real-time Sync Active</span>
        </div>
      </div>

      {/* Side by side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Mobile Phone Frame for Worker (Zero-Text UI) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            <Smartphone className="w-4 h-4 text-[#0B6B3A]" />
            <span>Worker Phone (مزدور کی اسکرین - Zero Text)</span>
          </div>

          {/* Realistic Mobile Device Frame */}
          <div className="w-full max-w-[390px] bg-gray-900 rounded-[48px] p-3 shadow-2xl border-4 border-gray-800 relative">
            {/* Phone Speaker Notch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-gray-900 rounded-full z-30" />

            {/* Screen Glass Container */}
            <div className="w-full min-h-[640px] max-h-[720px] bg-[#F8F9FA] rounded-[38px] overflow-y-auto overflow-x-hidden relative flex flex-col">
              <WorkerHome
                currentWorker={currentWorker}
                onWorkerRegistered={onWorkerRegistered}
                activeOffers={activeOffers}
                onAcceptOffer={onAcceptOffer}
                onDeclineOffer={onDeclineOffer}
                onRequestConsent={onRequestConsent}
                hasConsent={hasConsent}
                onRequestFeedback={onRequestFeedback}
              />
            </div>
          </div>
        </div>

        {/* Sync Indicator in middle on desktop */}
        <div className="hidden lg:flex lg:col-span-1 items-center justify-center self-center py-12">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B6B3A] flex items-center justify-center shadow-xs">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        </div>

        {/* Right: Hirer Portal & Matching */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            <Monitor className="w-4 h-4 text-blue-600" />
            <span>Hirer Portal (مالک / ٹھیکیدار ڈیش بورڈ)</span>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden min-h-[640px]">
            <HirerHome
              workers={workers}
              onPostJobAndSendOffer={onPostJobAndSendOffer}
              onRequestFeedback={() => {}}
              hasConsent={hasConsent}
              onRequestConsent={onRequestConsent}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
