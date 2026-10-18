import React, { useState, useEffect, useRef } from 'react';
import { WorkerProfile, JobOffer } from '../../types';
import { api, SKILL_DEFINITIONS } from '../../services/api';
import { voiceService } from '../../services/voice';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { BottomSheet } from '../ui/BottomSheet';
import {
  MapPin,
  Volume2,
  Check,
  X,
  Plus,
  Minus,
  Sparkles,
  AlertTriangle,
  Radio,
  Briefcase,
} from 'lucide-react';

interface WorkerHomeTabProps {
  worker: WorkerProfile;
  onAcceptOffer: (offerId: string) => void;
  onOfferDeclined?: () => void;
}

export const WorkerHomeTab: React.FC<WorkerHomeTabProps> = ({
  worker,
  onAcceptOffer,
  onOfferDeclined,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(worker.is_online ?? true);
  const [incomingOffer, setIncomingOffer] = useState<JobOffer | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [isCounterSheetOpen, setIsCounterSheetOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState(3800);
  const countdownTimerRef = useRef<any>(null);

  const handleToggleOnline = async (online: boolean) => {
    setIsOnline(online);
    await api.updateWorkerAvailability(online, worker.latitude, worker.longitude);

    if (online) {
      voiceService.speak('آپ آن لائن ہو چکے ہیں۔ نیا کام تلاش کیا جا رہا ہے۔', 'ur');
      triggerSimulatedOffer();
    } else {
      setIncomingOffer(null);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }
  };

  // Realtime subscription: Workers subscribe to new offers filtered by their worker_id
  useEffect(() => {
    if (!worker?.id || !isOnline) return;

    const unsubscribe = api.subscribeToWorkerOffers(worker.id, (newOffer: JobOffer) => {
      setIncomingOffer(newOffer);
      setCounterPrice(newOffer.rate_pkr);
      setCountdown(30);

      // Auto-play voice note on incoming offer
      if (newOffer.voice_message_ur) {
        voiceService.speak(newOffer.voice_message_ur, 'ur');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [worker?.id, isOnline]);

  const triggerSimulatedOffer = () => {
    setTimeout(async () => {
      const offers = await api.getIncomingJobOffers();
      const offer = offers[0] || {
        id: `off-${Date.now()}`,
        job_id: 'job-101',
        worker_id: worker.id,
        job_title: '2 Rooms Wall Painting',
        skill: worker.primary_skill,
        area: 'Gulshan-e-Iqbal',
        city: 'Karachi',
        rate_pkr: 3800,
        date: 'Today',
        distance_km: 2.8,
        urgency: 'normal' as const,
        voice_message_ur: 'احمد بھائی، گلشن اقبال میں دو کمروں کی پینٹنگ کی نوکری ہے۔ مزدوری ۳۸۰۰ روپے ہے۔ کیا آپ جانا چاہتے ہیں؟',
        is_below_market: false,
        status: 'pending' as const,
        created_at: 'Just now',
      };

      setIncomingOffer(offer);
      setCounterPrice(offer.rate_pkr);
      setCountdown(30);

      // Auto-play voice note
      voiceService.speak(offer.voice_message_ur, 'ur');
    }, 4500);
  };

  useEffect(() => {
    if (incomingOffer) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            setIncomingOffer(null);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [incomingOffer]);

  useEffect(() => {
    if (isOnline && !incomingOffer) {
      triggerSimulatedOffer();
    }
  }, [isOnline]);

  const handleAccept = () => {
    if (!incomingOffer) return;
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    voiceService.speak('آپ نے نوکری قبول کر لی ہے۔ کسٹمر سے رابطہ کروایا جا رہا ہے۔', 'ur');
    onAcceptOffer(incomingOffer.id);
  };

  const handleDecline = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setIncomingOffer(null);
    onOfferDeclined?.();
  };

  const handleSendCounter = async () => {
    if (!incomingOffer) return;
    await api.counterJobOffer(incomingOffer.id, counterPrice);
    setIsCounterSheetOpen(false);
    voiceService.speak(`آپ نے ${counterPrice} روپے کی پیشکش بھیج دی ہے۔`, 'ur');
    onAcceptOffer(incomingOffer.id);
  };

  const skillDef = incomingOffer
    ? SKILL_DEFINITIONS[incomingOffer.skill] || SKILL_DEFINITIONS.painter
    : SKILL_DEFINITIONS[worker.primary_skill] || SKILL_DEFINITIONS.painter;

  // STRICT RULE: If incoming job, show FULL-SCREEN TAKEOVER with price as largest element
  if (incomingOffer) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F7F8F5] p-5 pb-8 flex flex-col justify-between overflow-y-auto animate-in zoom-in-95 duration-200 max-w-md mx-auto">
        {/* Top Header: Countdown & Audio Replay */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            {/* 30s Countdown Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center font-bold text-sm text-[#0B6B3A]">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#E4E8E2"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#0B6B3A"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={125}
                  strokeDashoffset={125 - (countdown / 30) * 125}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute font-black">{countdown}s</span>
            </div>
            <div>
              <span className="font-urdu text-base font-bold text-[#0B6B3A] block leading-tight">
                نئی نوکری کی پیشکش!
              </span>
              <span className="text-[11px] font-semibold text-[#6B7A72]">
                Incoming Job Request
              </span>
            </div>
          </div>

          <button
            onClick={() => voiceService.speak(incomingOffer.voice_message_ur, 'ur')}
            className="w-14 h-14 rounded-2xl bg-white border border-[#E4E8E2] text-[#0B6B3A] hover:bg-gray-50 flex items-center justify-center active:scale-95 transition-all shadow-xs"
            title="Replay Voice Note"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>

        {/* Center Card: Price is the LARGEST Element */}
        <Card className="my-auto border-2 border-[#0B6B3A] p-6 shadow-xl text-center bg-white">
          {/* Fair Rate Badge */}
          <div className="mb-4 flex justify-center">
            {incomingOffer.is_below_market ? (
              <Badge variant="warning" icon={<AlertTriangle className="w-4 h-4" />}>
                مارکیٹ سے کم ریٹ (Sub-Market Rate)
              </Badge>
            ) : (
              <Badge variant="fair" icon={<Sparkles className="w-4 h-4" />}>
                منصفانہ اجرت (Fair Market Rate ✓)
              </Badge>
            )}
          </div>

          {/* Skill & Area */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{skillDef.icon}</span>
            <div className="text-left">
              <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
                {incomingOffer.job_title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B7A72]">
                <MapPin className="w-3.5 h-3.5 text-[#D64545]" />
                <span>{incomingOffer.area}</span>
                <span>•</span>
                <span>{incomingOffer.distance_km} km away</span>
              </div>
            </div>
          </div>

          {/* HIERARCHY RULE: The Price is the LARGEST element on screen */}
          <div className="py-6 border-y border-[#E4E8E2] my-4 bg-[#F7F8F5]/60 rounded-2xl">
            <span className="text-xs font-bold text-[#6B7A72] font-urdu block mb-1">
              کل یومیہ مزدوری (Earnings)
            </span>
            <div className="text-5xl font-black text-[#0B6B3A] tracking-tight">
              ₨ {incomingOffer.rate_pkr.toLocaleString()}
            </div>
            <span className="text-xs font-bold text-[#1F9D55] mt-1 block">
              نقد ادائیگی (Cash on Site)
            </span>
          </div>

          {/* Counter Offer Secondary Link */}
          <button
            onClick={() => setIsCounterSheetOpen(true)}
            className="w-full py-2 text-sm font-bold text-[#0B6B3A] hover:underline font-urdu cursor-pointer"
          >
            مزدوری بڑھانے کی درخواست (Counter Offer) →
          </button>
        </Card>

        {/* Bottom Actions: ONE primary action (64px Accept) + Secondary Decline */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleAccept}
            icon={<Check className="w-7 h-7 stroke-[3]" />}
          >
            قبول ہے (Accept Offer)
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={handleDecline}
            className="text-[#D64545] hover:bg-[#D64545]/5"
            icon={<X className="w-5 h-5 stroke-[2.5]" />}
          >
            رد کریں (Decline)
          </Button>
        </div>

        {/* Counter Offer Bottom Sheet */}
        <BottomSheet
          isOpen={isCounterSheetOpen}
          onClose={() => setIsCounterSheetOpen(false)}
          titleUr="مزدوری کی نئی پیشکش درج کریں"
          title="Counter Offer (Negotiate Rate)"
        >
          <div className="py-4 text-center">
            <p className="text-xs font-semibold text-[#6B7A72] mb-6">
              Adjust your proposed rate using the steppers below
            </p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                onClick={() => setCounterPrice(p => Math.max(1500, p - 100))}
                className="w-16 h-16 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-[#14201A] flex items-center justify-center font-black text-2xl"
              >
                <Minus className="w-8 h-8" />
              </button>

              <div className="text-center">
                <span className="text-xs font-bold text-[#6B7A72] block font-urdu">نئی رقم</span>
                <span className="text-4xl font-black text-[#0B6B3A]">
                  ₨ {counterPrice.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setCounterPrice(p => p + 100)}
                className="w-16 h-16 rounded-2xl bg-[#0B6B3A]/10 hover:bg-[#0B6B3A]/20 active:scale-95 text-[#0B6B3A] flex items-center justify-center font-black text-2xl"
              >
                <Plus className="w-8 h-8" />
              </button>
            </div>

            <Button size="lg" onClick={handleSendCounter}>
              پیشکش بھیجیں (Send ₨ {counterPrice.toLocaleString()} Offer)
            </Button>
          </div>
        </BottomSheet>
      </div>
    );
  }

  // STRICT RULE: Worker Home must show ONLY:
  // 1. The Online toggle
  // 2. The status illustration
  // 3. One big button (when offline) or radar pulse (when online).
  // NOTHING ELSE.
  return (
    <div className="flex-1 flex flex-col justify-between p-5 pb-24 max-w-md mx-auto w-full min-h-[calc(100dvh-80px)]">
      {/* 1. Online Toggle at Top */}
      <div className="pt-2">
        <Toggle checked={isOnline} onChange={handleToggleOnline} />
      </div>

      {/* 2. Middle Status Illustration */}
      {isOnline ? (
        /* ONLINE STATE: Soft Radar Pulse Animation */
        <div className="my-auto flex flex-col items-center justify-center text-center animate-in fade-in">
          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[#0B6B3A]/30 animate-radar-ring" />
            <div
              className="absolute inset-4 rounded-full border-2 border-[#0B6B3A]/40 animate-radar-ring"
              style={{ animationDelay: '0.8s' }}
            />
            <div className="w-24 h-24 rounded-full bg-[#0B6B3A] text-white flex items-center justify-center shadow-xl z-10">
              <Radio className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-[#14201A] font-urdu leading-tight mb-2">
            کام تلاش ہو رہی ہے...
          </h2>
          <p className="text-sm font-semibold text-[#6B7A72] max-w-xs leading-relaxed">
            Looking for nearby jobs in {worker.location_area}. Requests appear automatically.
          </p>
        </div>
      ) : (
        /* OFFLINE STATE: Calm Illustration + Text */
        <div className="my-auto flex flex-col items-center justify-center text-center animate-in fade-in">
          <div className="w-28 h-28 rounded-full bg-gray-100 text-[#6B7A72] flex items-center justify-center mb-6">
            <Briefcase className="w-14 h-14" />
          </div>

          <h2 className="text-3xl font-extrabold text-[#14201A] font-urdu leading-tight mb-2">
            آپ آف لائن ہیں
          </h2>
          <p className="text-sm text-[#6B7A72] max-w-xs leading-relaxed">
            کام کی نئی پیشکشیں حاصل کرنے کے لیے آن لائن بٹن دبائیں۔
          </p>
        </div>
      )}

      {/* 3. Bottom Area: ONE Primary Button (when offline) or status label (when online) */}
      <div className="pt-4">
        {!isOnline && (
          <Button
            size="lg"
            onClick={() => handleToggleOnline(true)}
            icon={<Check className="w-6 h-6 stroke-[3]" />}
          >
            کام کے لیے دستیاب ہوں (Go Online)
          </Button>
        )}
      </div>
    </div>
  );
};
