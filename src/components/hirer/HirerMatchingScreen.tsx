import React, { useState, useEffect } from 'react';
import { JobBookingRequest, MatchedWorkerOption } from '../../types';
import { api, SKILL_DEFINITIONS } from '../../services/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BottomSheet } from '../ui/BottomSheet';
import { EmptyState } from '../ui/EmptyState';
import {
  MapPin,
  Clock,
  Star,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Radio,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';

interface HirerMatchingScreenProps {
  request: JobBookingRequest;
  onHireWorker: (option: MatchedWorkerOption) => void;
  onCancel: () => void;
}

export const HirerMatchingScreen: React.FC<HirerMatchingScreenProps> = ({
  request,
  onHireWorker,
  onCancel,
}) => {
  const [isSearching, setIsSearching] = useState(true);
  const [streamedWorkers, setStreamedWorkers] = useState<MatchedWorkerOption[]>([]);
  const [selectedScoreWorker, setSelectedScoreWorker] = useState<MatchedWorkerOption | null>(null);
  const [counterSheetWorker, setCounterSheetWorker] = useState<MatchedWorkerOption | null>(null);
  const [counterPrice, setCounterPrice] = useState(request.offeredPricePkr);

  useEffect(() => {
    let timer1: any;
    let timer2: any;
    let timer3: any;

    api.getMatchingWorkers(request).then(workers => {
      timer1 = setTimeout(() => {
        setStreamedWorkers([workers[0]]);
        setIsSearching(false);
      }, 1500);

      timer2 = setTimeout(() => {
        if (workers[1]) {
          setStreamedWorkers(prev => [...prev, workers[1]]);
        }
      }, 3500);

      timer3 = setTimeout(() => {
        if (workers[2]) {
          setStreamedWorkers(prev => [...prev, workers[2]]);
        }
      }, 5500);
    });

    // Supabase Realtime subscription for status updates (countered, accepted, declined)
    const unsubscribe = api.subscribeToJobOffers('all-matching', (status, updatedOffer) => {
      if (status === 'countered' && updatedOffer?.counter_price_pkr) {
        setStreamedWorkers(prev =>
          prev.map(item =>
            item.worker.id === updatedOffer.worker_id
              ? {
                  ...item,
                  hasCountered: true,
                  counterPricePkr: updatedOffer.counter_price_pkr,
                  offeredPricePkr: updatedOffer.counter_price_pkr,
                }
              : item
          )
        );
      } else if (status === 'declined') {
        setStreamedWorkers(prev => prev.filter(item => item.worker.id !== updatedOffer?.worker_id));
      }
    });

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      unsubscribe();
    };
  }, [request]);

  const handleSendCounter = () => {
    if (!counterSheetWorker) return;
    const updated = {
      ...counterSheetWorker,
      hasCountered: true,
      counterPricePkr: counterPrice,
      offeredPricePkr: counterPrice,
    };
    onHireWorker(updated);
  };

  const def = SKILL_DEFINITIONS[request.skill] || SKILL_DEFINITIONS.painter;

  return (
    <div className="flex-1 flex flex-col justify-between p-5 pb-24 max-w-md mx-auto w-full min-h-[100dvh]">
      <div>
        {/* Top Navigation Header with Cancel Action */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E4E8E2]">
          <div>
            <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
              کاریگروں کی پیشکشیں (Worker Bids)
            </h2>
            <p className="text-xs text-[#6B7A72]">
              {request.sizeAmount} {def.unit} {def.labelEn} in {request.area}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="h-10 px-3 rounded-xl text-xs font-bold text-[#D64545] hover:bg-red-50 active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>

        {/* Searching Radar Animation */}
        {isSearching && (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-[#0B6B3A]/30 animate-radar-ring" />
              <div
                className="absolute inset-3 rounded-full border-2 border-[#0B6B3A]/40 animate-radar-ring"
                style={{ animationDelay: '0.6s' }}
              />
              <div className="w-20 h-20 rounded-full bg-[#0B6B3A] text-white flex items-center justify-center shadow-lg z-10">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold font-urdu text-[#14201A]">
              قریبی کاریگر تلاش کیے جا رہے ہیں...
            </h3>
            <p className="text-xs text-[#6B7A72] mt-1">
              Broadcasting your ₨ {request.offeredPricePkr.toLocaleString()} offer to nearby verified chowks
            </p>
          </div>
        )}

        {/* Streamed Worker Offer Cards */}
        {!isSearching && streamedWorkers.length === 0 && (
          <EmptyState
            icon={<AlertCircle className="w-8 h-8 text-[#6B7A72]" />}
            title="No workers available yet"
            titleUr="اس وقت کوئی کاریگر دستیاب نہیں"
            description="Broadcasting to other nearby chowks. Try raising your offer or expanding the area."
            action={
              <Button size="md" variant="secondary" onClick={onCancel}>
                Modify Offer Price
              </Button>
            }
          />
        )}

        <div className="space-y-3">
          {streamedWorkers.map((option, idx) => {
            const { worker, matchScore, distanceKm, etaMinutes, whyMatched, hasCountered, counterPricePkr } = option;
            const price = hasCountered ? counterPricePkr! : option.offeredPricePkr;

            return (
              <Card
                key={worker.id}
                className={`p-4 border-2 transition-all animate-in slide-in-from-bottom duration-300 ${
                  idx === 0 ? 'border-[#0B6B3A]' : 'border-[#E4E8E2]'
                }`}
              >
                {/* Top Worker Identity & Rating */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-13 h-13 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xs shrink-0"
                      style={{ backgroundColor: worker.avatar_color }}
                    >
                      {def.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-base text-[#14201A] leading-tight">
                          {worker.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F2B705]/20 text-[#14201A]">
                          {worker.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#6B7A72] mt-0.5">
                        <div className="flex items-center gap-1 text-[#F2B705] font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#F2B705]" />
                          <span>{worker.reliability_score}</span>
                          <span className="text-[#6B7A72] font-normal">({worker.completed_jobs_count})</span>
                        </div>
                        <span>•</span>
                        <span>{distanceKm} km ({etaMinutes}m ETA)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-[#0B6B3A]">
                      ₨ {price.toLocaleString()}
                    </span>
                    {hasCountered && (
                      <span className="text-[10px] font-bold text-[#D64545] block">
                        کاریگر کی پیشکش
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Why Matched Chip */}
                <button
                  type="button"
                  onClick={() => setSelectedScoreWorker(option)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#0B6B3A]/5 hover:bg-[#0B6B3A]/10 border border-[#0B6B3A]/20 text-xs text-[#14201A] mb-3 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-[#0B6B3A] shrink-0" />
                    <span className="truncate">{whyMatched}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#0B6B3A] shrink-0">
                    {matchScore}% Match →
                  </span>
                </button>

                {/* ONE primary action per card: Hire (64px) + Counter (ghost secondary) */}
                <div className="flex items-center gap-2">
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => onHireWorker(option)}
                    className="flex-1"
                  >
                    حائر کریں (Hire ₨ {price.toLocaleString()})
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setCounterSheetWorker(option);
                      setCounterPrice(price);
                    }}
                    className="px-4 h-14 rounded-2xl border border-[#E4E8E2] text-xs font-bold text-[#6B7A72] hover:bg-gray-50 active:scale-95"
                  >
                    Counter
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Score Breakdown BottomSheet */}
      {selectedScoreWorker && (
        <BottomSheet
          isOpen={!!selectedScoreWorker}
          onClose={() => setSelectedScoreWorker(null)}
          titleUr="میچنگ اسکور کا تفصیلی تجزیہ"
          title={`Match Analysis: ${selectedScoreWorker.worker.name}`}
        >
          <div className="py-2 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0B6B3A]/10">
              <span className="font-bold text-sm text-[#0B6B3A]">Total Match Score</span>
              <span className="text-3xl font-black text-[#0B6B3A]">
                {selectedScoreWorker.matchScore}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Skill & Tool Compatibility</span>
                  <span>{selectedScoreWorker.scoreBreakdown.skillMatch} / 30</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0B6B3A] rounded-full"
                    style={{ width: `${(selectedScoreWorker.scoreBreakdown.skillMatch / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Geographic Proximity ({selectedScoreWorker.distanceKm} km)</span>
                  <span>{selectedScoreWorker.scoreBreakdown.proximity} / 25</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(selectedScoreWorker.scoreBreakdown.proximity / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Reliability Rating & Past Jobs</span>
                  <span>{selectedScoreWorker.scoreBreakdown.reliability} / 15</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F2B705] rounded-full"
                    style={{ width: `${(selectedScoreWorker.scoreBreakdown.reliability / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => {
                onHireWorker(selectedScoreWorker);
                setSelectedScoreWorker(null);
              }}
            >
              Select & Hire Worker
            </Button>
          </div>
        </BottomSheet>
      )}

      {/* Counter Offer BottomSheet */}
      {counterSheetWorker && (
        <BottomSheet
          isOpen={!!counterSheetWorker}
          onClose={() => setCounterSheetWorker(null)}
          titleUr="کاریگر کو جوابی پیشکش بھیجیں"
          title={`Counter Offer to ${counterSheetWorker.worker.name}`}
        >
          <div className="py-4 text-center">
            <div className="flex items-center justify-center gap-6 my-6">
              <button
                onClick={() => setCounterPrice(p => Math.max(1500, p - 100))}
                className="w-14 h-14 rounded-2xl bg-gray-100 text-xl font-bold active:scale-95"
              >
                -
              </button>
              <div className="text-3xl font-black text-[#0B6B3A]">
                ₨ {counterPrice.toLocaleString()}
              </div>
              <button
                onClick={() => setCounterPrice(p => p + 100)}
                className="w-14 h-14 rounded-2xl bg-[#0B6B3A]/10 text-[#0B6B3A] text-xl font-bold active:scale-95"
              >
                +
              </button>
            </div>

            <Button size="lg" onClick={handleSendCounter}>
              Send ₨ {counterPrice.toLocaleString()} Offer
            </Button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
