import React, { useState } from 'react';
import { ActiveJob } from '../../types';
import { api, SKILL_DEFINITIONS } from '../../services/api';
import { voiceService } from '../../services/voice';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SwipeSlider } from '../ui/SwipeSlider';
import { StarRating } from '../ui/StarRating';
import { MicButton } from '../ui/MicButton';
import {
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface WorkerActiveJobProps {
  job: ActiveJob;
  onFinishJob: () => void;
}

export const WorkerActiveJob: React.FC<WorkerActiveJobProps> = ({ job, onFinishJob }) => {
  const [jobStatus, setJobStatus] = useState<'heading_to_site' | 'arrived' | 'rating' | 'summary'>(
    job.status === 'arrived' ? 'arrived' : 'heading_to_site'
  );
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [isRecordingReview, setIsRecordingReview] = useState(false);

  const handleArrived = async () => {
    await api.updateActiveJobStatus('arrived');
    setJobStatus('arrived');
    voiceService.speak('آپ کام کی جگہ پہنچ چکے ہیں۔ کام شروع کریں۔', 'ur');
  };

  const handleCompleted = async () => {
    await api.updateActiveJobStatus('completed');
    setJobStatus('rating');
    voiceService.speak('کام مکمل ہو گیا۔ مالک کا تجربہ کیسا رہا؟ ریویو دیں۔', 'ur');
  };

  const handleSubmitRating = async () => {
    setJobStatus('summary');
    voiceService.speak(`مبارک ہو! آپ کے اکاؤنٹ میں ${job.agreedPricePkr} روپے کا اضافہ ہو گیا۔`, 'ur');
  };

  const skillDef = SKILL_DEFINITIONS[job.skill] || SKILL_DEFINITIONS.painter;

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-white overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* 1. In Progress States: Heading to Site or Arrived */}
        {(jobStatus === 'heading_to_site' || jobStatus === 'arrived') && (
          <div className="space-y-4 animate-in fade-in">
            {/* ... map and profile card ... */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1F9D55] animate-ping" />
                <span className="text-xs font-bold text-[#0B6B3A] uppercase tracking-wider">
                  {jobStatus === 'heading_to_site' ? 'راستے میں ہیں (On the way)' : 'کام کی جگہ پر ہیں (At Site)'}
                </span>
              </div>
              <span className="text-xs font-bold text-[#6B7A72]">
                ETA: {job.etaMinutes} mins
              </span>
            </div>

            <div className="w-full h-44 rounded-[24px] bg-[#E4E8E2] border border-[#E4E8E2] relative overflow-hidden flex items-center justify-center shadow-inner">
              <iframe
                title="Route Map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=67.02%2C24.88%2C67.12%2C24.94&layer=mapnik&marker=${job.jobLat}%2C${job.jobLng}`}
                className="w-full h-full border-0 pointer-events-none opacity-85"
              />
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold text-[#14201A] shadow-md flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#0B6B3A]" />
                <span>{job.area}</span>
              </div>
            </div>

            <Card className="border border-[#E4E8E2] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#6B7A72] font-urdu">مالک کا نام</span>
                  <h3 className="text-xl font-black text-[#14201A] leading-tight">
                    {job.hirerName}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#6B7A72] font-urdu">طے شدہ مزدوری</span>
                  <span className="text-2xl font-black text-[#0B6B3A] block">
                    ₨ {job.agreedPricePkr.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[#F7F8F5] rounded-2xl flex items-center justify-between border border-[#E4E8E2]">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0B6B3A]" />
                  <span className="text-sm font-bold text-[#14201A]">
                    {showFullPhone ? job.hirerPhone : '0333-***1948'}
                  </span>
                </div>
                <button
                  onClick={() => setShowFullPhone(!showFullPhone)}
                  className="px-3 py-1.5 rounded-xl bg-[#0B6B3A] text-white text-xs font-bold active:scale-95 transition-all"
                >
                  {showFullPhone ? 'Hide' : 'کال کریں (Call)'}
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* 2. Rating State */}
        {jobStatus === 'rating' && (
          <div className="py-6 text-center animate-in zoom-in-95">
            <h2 className="text-3xl font-extrabold text-[#14201A] font-urdu leading-tight mb-2">
              مالک کا رویہ کیسا رہا؟
            </h2>
            <p className="text-xs text-[#6B7A72] mb-8">
              Rate your experience with {job.hirerName}
            </p>
            <div className="mb-8">
              <StarRating rating={ratingStars} interactive size="lg" onChange={stars => setRatingStars(stars)} />
            </div>
            <div className="mb-6">
              <MicButton
                isRecording={isRecordingReview}
                onClick={() => setIsRecordingReview(!isRecordingReview)}
                size="md"
                labelUr={isRecordingReview ? 'سن رہا ہوں...' : 'آواز سے بتائیں'}
                labelEn="Speak review"
              />
            </div>
          </div>
        )}

        {/* 3. Summary State */}
        {jobStatus === 'summary' && (
          <div className="py-6 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-[#1F9D55]/15 text-[#1F9D55] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#14201A] font-urdu leading-tight mb-1">
              مبارک ہو! مزدوری وصول
            </h2>
            <p className="text-xs text-[#6B7A72] mb-6">Payment Summary & Receipt</p>
            <Card className="mb-6 space-y-3 text-left">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-[#6B7A72] font-urdu">کام (Job):</span>
                <span className="font-bold text-[#14201A]">{job.jobTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-[#6B7A72] font-urdu">مالک (Hirer):</span>
                <span className="font-bold text-[#14201A]">{job.hirerName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B7A72] font-urdu">وصول شدہ رقم:</span>
                <span className="font-black text-2xl text-[#0B6B3A]">
                  ₨ {job.agreedPricePkr.toLocaleString()}
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="flex-none p-5 bg-white border-t border-[#E4E8E2]">
        {(jobStatus === 'heading_to_site' || jobStatus === 'arrived') && (
          <SwipeSlider
            labelUr={jobStatus === 'heading_to_site' ? 'میں پہنچ گیا ہوں' : 'کام مکمل ہو گیا'}
            labelEn={jobStatus === 'heading_to_site' ? 'Swipe when at site' : 'Swipe when work is done'}
            color={jobStatus === 'heading_to_site' ? '#0B6B3A' : '#1F9D55'}
            onConfirm={jobStatus === 'heading_to_site' ? handleArrived : handleCompleted}
          />
        )}
        {jobStatus === 'rating' && (
          <Button size="lg" className="w-full" onClick={handleSubmitRating}>
            ریٹنگ محفوظ کریں (Confirm Rating)
          </Button>
        )}
        {jobStatus === 'summary' && (
          <Button size="lg" className="w-full" onClick={onFinishJob}>
            واپس ہوم اسکرین (Back to Home)
          </Button>
        )}
      </div>
    </div>
  );
};
