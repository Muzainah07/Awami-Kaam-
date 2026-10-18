import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Users,
  Search,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { JobListing, WorkerProfile, WorkerMatch, SkillType, WageEstimate } from '../types';
import { SKILL_WAGE_BENCHMARKS } from '../data/seed';
import { rankWorkersForJob } from '../services/matching';
import { calculateLocalFairWage, fetchAIFairWage } from '../services/wage';
import { voiceService } from '../services/voice';

interface HirerHomeProps {
  workers: WorkerProfile[];
  onPostJobAndSendOffer: (job: JobListing, matchedWorker: WorkerProfile) => void;
  onRequestFeedback: (job: JobListing, worker: WorkerProfile) => void;
  hasConsent: boolean;
  onRequestConsent: () => void;
}

export const HirerHome: React.FC<HirerHomeProps> = ({
  workers,
  onPostJobAndSendOffer,
  onRequestFeedback,
  hasConsent,
  onRequestConsent,
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobListing | null>(null);
  const [fairWage, setFairWage] = useState<WageEstimate | null>(null);
  const [matchedWorkers, setMatchedWorkers] = useState<WorkerMatch[]>([]);
  const [offeredRate, setOfferedRate] = useState<number>(3800);
  const [offerSentWorkerId, setOfferSentWorkerId] = useState<string | null>(null);

  const samplePresets = [
    {
      title: '2 Rooms Wall Painting',
      prompt: 'Mujhe kal 2 kamre paint karwane hain Gulshan-e-Iqbal mein. Wall putty aur emulsion paint chahiye.',
      skill: 'painter' as SkillType,
      area: 'Gulshan-e-Iqbal',
      rate: 3800,
      urgency: 'normal' as const,
    },
    {
      title: 'Emergency Bathroom Pipe Leak',
      prompt: 'Liaquatabad mein bathroom ki PPR pipe leak ho rahi hai, foran plumber chahiye aaj.',
      skill: 'plumber' as SkillType,
      area: 'Liaquatabad',
      rate: 4200,
      urgency: 'urgent' as const,
    },
    {
      title: 'Main DB Board Circuit Tripping',
      prompt: 'Saddar market mein dukan ka main switchboard bar bar trip kar raha hai, electrician chahiye.',
      skill: 'electrician' as SkillType,
      area: 'Saddar',
      rate: 4500,
      urgency: 'urgent' as const,
    },
    {
      title: 'Underpayment Scam Test (Low Wage)',
      prompt: 'Korangi mein 5 kamre paint karne hain poore din, sirf 1500 rupay doonga.',
      skill: 'painter' as SkillType,
      area: 'Korangi',
      rate: 1500,
      urgency: 'emergency' as const,
    },
  ];

  const handleToggleVoice = async () => {
    if (!hasConsent) {
      onRequestConsent();
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      setIsAnalyzing(true);
      try {
        const { base64, mimeType } = await voiceService.stopRecording();
        await parseJobWithGemini(undefined, base64, mimeType);
      } catch (err) {
        console.error('Hirer voice error:', err);
        setIsAnalyzing(false);
      }
    } else {
      try {
        await voiceService.startRecording();
        setIsRecording(true);
      } catch (err) {
        console.error('Hirer mic error:', err);
      }
    }
  };

  const parseJobWithGemini = async (textPrompt?: string, audioBase64?: string, mimeType?: string) => {
    setIsAnalyzing(true);
    setOfferSentWorkerId(null);

    try {
      const res = await fetch('/api/gemini/hirer-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textPrompt: textPrompt || jobDescription,
          audioBase64,
          mimeType,
        }),
      });

      const data = await res.json();

      const skill = (data.skill_needed || 'painter') as SkillType;
      const area = data.area || 'Gulshan-e-Iqbal';
      const city = data.city || 'Karachi';
      const rate = data.offered_rate_pkr || (data.scam_risk?.is_suspicious ? 1500 : 3800);

      const job: JobListing = {
        id: `job-${Date.now()}`,
        title: data.title || `${skill} required in ${area}`,
        job_type: data.job_type || 'Daily Wage Work',
        skill_needed: skill,
        workers_needed: data.workers_needed || 1,
        area,
        city,
        latitude: area === 'Liaquatabad' ? 24.9080 : area === 'Saddar' ? 24.8569 : area === 'Korangi' ? 24.8322 : 24.9207,
        longitude: area === 'Liaquatabad' ? 67.0435 : area === 'Saddar' ? 67.0307 : area === 'Korangi' ? 67.1354 : 67.0928,
        date: data.date === 'tomorrow' ? 'tomorrow' : 'today',
        job_size: data.job_size || 'Standard daily assignment',
        urgency: data.urgency === 'urgent' ? 'urgent' : data.urgency === 'emergency' ? 'emergency' : 'normal',
        special_requirements: data.special_requirements || 'Standard tools and punctual attendance',
        offered_rate_pkr: rate,
        hirer_name: 'Hirer (Aap)',
        hirer_phone: '0300-***7890',
        created_at: 'Just now',
        status: 'open',
        voice_summary_ur: data.voice_summary_ur || `${area} mein ${skill} ka kaam, mazdoori ${rate} rupay`,
        voice_summary_en: data.voice_summary_en || `${skill} work in ${area}, rate PKR ${rate}`,
        scam_risk: data.scam_risk,
      };

      setCurrentJob(job);
      setOfferedRate(rate);

      const wage = await fetchAIFairWage({
        skill: job.skill_needed,
        area: job.area,
        city: job.city,
        jobSize: job.job_size,
        urgency: job.urgency,
        offeredRatePkr: rate,
      });
      setFairWage(wage);

      const ranked = rankWorkersForJob(job, workers, 3);
      setMatchedWorkers(ranked);

      setIsAnalyzing(false);
    } catch (err) {
      console.error('Job analysis error:', err);
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: typeof samplePresets[0]) => {
    setJobDescription(preset.prompt);
    parseJobWithGemini(preset.prompt);
  };

  const handleSendOffer = (worker: WorkerProfile) => {
    if (!currentJob) return;
    setOfferSentWorkerId(worker.id);

    const updatedJob: JobListing = {
      ...currentJob,
      offered_rate_pkr: offeredRate,
      assigned_worker_id: worker.id,
      status: 'matched',
    };

    onPostJobAndSendOffer(updatedJob, worker);
  };

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto bg-[#F8F9FA] p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0B6B3A] text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              مالک اور ٹھیکیدار پورٹل (Hirer Portal)
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-urdu">
              مزدور یا کاریگر کی تلاش
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Describe your requirement by voice or text. Gemini extracts parameters & matches ranked workers.
            </p>
          </div>

          <button
            onClick={handleToggleVoice}
            className={`px-5 py-3 rounded-2xl flex items-center gap-2.5 font-bold text-sm shadow-md transition-all active:scale-95 shrink-0 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                : 'bg-[#0B6B3A] text-white hover:bg-[#08552e]'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="flex flex-col text-left">
              <span>{isRecording ? 'بولنا بند کریں (Stop)' : 'آواز سے بتائیں (Speak Job)'}</span>
              {isRecording && <span className="text-[10px] opacity-75">Recording...</span>}
            </span>
          </button>
        </div>

        {/* Input Box & Quick Demo Presets */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (jobDescription.trim()) parseJobWithGemini(jobDescription);
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              کام کی تفصیل (Job Description)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="مثال: مجھے کل 2 کمرے پینٹ کروانے ہیں گلشن اقبال میں..."
                className="w-full p-4 rounded-2xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B6B3A] font-urdu leading-relaxed text-right"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-gray-400">
                Urdu, English, Punjabi, or Roman Urdu supported
              </span>
              <button
                type="submit"
                disabled={isAnalyzing || !jobDescription.trim()}
                className="px-6 py-2.5 bg-[#0B6B3A] hover:bg-[#08552e] text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-[#0B6B3A]/20"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI تلاش کر رہا ہے...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>تلاش کریں (Search Workers)</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              فوری ٹیسٹ کی نوکریاں (Demo Test Presets)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-3 text-left rounded-2xl border border-gray-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-gray-800 group-hover:text-[#0B6B3A]">
                      {preset.title}
                    </div>
                    <div className="text-[11px] text-gray-500 font-urdu mt-0.5">
                      {preset.prompt.slice(0, 45)}...
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0B6B3A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Extraction & Fair Wage Engine Result */}
        {currentJob && fairWage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Job Parsed Card */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Extracted Job
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-[#0B6B3A]">
                  {currentJob.skill_needed.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-gray-900 text-lg font-urdu">
                  {currentJob.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{currentJob.area}, {currentJob.city}</span>
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="flex justify-between">
                  <span>Scope / Size:</span>
                  <span className="font-semibold text-gray-900">{currentJob.job_size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-semibold text-gray-900 capitalize">{currentJob.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Urgency:</span>
                  <span className="font-semibold text-gray-900 capitalize">{currentJob.urgency}</span>
                </div>
              </div>

              {currentJob.scam_risk?.is_suspicious && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>AI Scam / Underpayment Guard Alert</span>
                  </div>
                  {currentJob.scam_risk.reasons.map((r, i) => (
                    <p key={i} className="text-[11px] text-rose-700 leading-tight">
                      • {r}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* AI Fair Wage Engine Card */}
            <div className="md:col-span-2 bg-linear-to-br from-[#0B6B3A] to-[#044321] text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                    AI Fair Wage Engine (منصفانہ اجرت)
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      fairWage.is_fair
                        ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                        : 'bg-rose-500 text-white animate-pulse'
                    }`}
                  >
                    {fairWage.is_fair ? '✓ Fair Wage' : '⚠️ Sub-Market Wage'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
                  <div className="bg-white/10 rounded-2xl p-3">
                    <span className="text-[10px] text-emerald-200 uppercase font-semibold">
                      Market Range
                    </span>
                    <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                      ₨ {fairWage.min_rate_pkr.toLocaleString()} - {fairWage.max_rate_pkr.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-3">
                    <span className="text-[10px] text-emerald-200 uppercase font-semibold">
                      AI Recommended
                    </span>
                    <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
                      ₨ {fairWage.recommended_pkr.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-3 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-emerald-200 uppercase font-semibold">
                      Offered Rate
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <input
                        type="number"
                        step="100"
                        value={offeredRate}
                        onChange={e => setOfferedRate(parseInt(e.target.value) || 0)}
                        className="w-24 px-2 py-1 rounded-lg bg-white/20 text-white font-bold text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-300"
                      />
                      <span className="text-xs text-emerald-200">PKR</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-emerald-100 font-urdu leading-relaxed text-right">
                  {fairWage.worker_voice_warning_ur}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 text-[11px] text-emerald-200/80 flex items-center justify-between">
                <span>{fairWage.reason}</span>
                <span>Karachi Daily Wage Index 2026</span>
              </div>
            </div>
          </div>
        )}

        {/* Top Ranked Matching Workers */}
        {matchedWorkers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-gray-900 font-urdu">
                بہترین کاریگر (Top Ranked Matches via AI Hybrid Engine)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchedWorkers.map((match, idx) => {
                const { worker, score } = match;
                const isOfferSent = offerSentWorkerId === worker.id;
                return (
                    <div key={worker.id} className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/80">
                        {/* Simplified worker card to prevent overflow */}
                        <h4 className="font-bold text-gray-900">{worker.name}</h4>
                        <p className="text-xs text-gray-500">{worker.location_area}</p>
                        <button
                          onClick={() => handleSendOffer(worker)}
                          disabled={isOfferSent}
                          className={`w-full mt-3 py-3 rounded-2xl font-bold text-xs ${isOfferSent ? 'bg-emerald-600' : 'bg-[#0B6B3A]'} text-white`}
                        >
                          {isOfferSent ? 'پیشکش بھیج دی گئی' : 'آواز کی پیشکش بھیجیں'}
                        </button>
                    </div>
                );
              })}
            </div>
          </div>
        )}
  );
};
