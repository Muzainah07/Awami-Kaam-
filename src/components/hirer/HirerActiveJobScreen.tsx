import React, { useState } from 'react';
import { ActiveJob } from '../../types';
import { api, SKILL_DEFINITIONS } from '../../services/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StarRating } from '../ui/StarRating';
import {
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
} from 'lucide-react';

interface HirerActiveJobScreenProps {
  job: ActiveJob;
  onJobFinished: () => void;
}

export const HirerActiveJobScreen: React.FC<HirerActiveJobScreenProps> = ({
  job,
  onJobFinished,
}) => {
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(5);

  const def = SKILL_DEFINITIONS[job.skill] || SKILL_DEFINITIONS.painter;

  const handleCompleteAndRate = () => {
    setIsRatingModalOpen(true);
  };

  const handleConfirmRating = async () => {
    await api.updateActiveJobStatus('completed');
    setIsRatingModalOpen(false);
    onJobFinished();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 pb-24 max-w-md mx-auto w-full animate-in fade-in">
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0B6B3A] animate-ping" />
            <span className="text-xs font-bold text-[#0B6B3A] uppercase tracking-wider">
              {job.status === 'heading_to_site' ? 'Worker En Route' : 'Worker Arrived at Site'}
            </span>
          </div>
          <span className="text-xs font-bold text-[#6B7A72]">
            ETA: {job.etaMinutes} mins
          </span>
        </div>

        {/* Map Preview */}
        <div className="w-full h-48 rounded-[24px] bg-[#E4E8E2] border border-[#E4E8E2] relative overflow-hidden shadow-inner">
          <iframe
            title="Hirer Route Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=67.02%2C24.88%2C67.12%2C24.94&layer=mapnik&marker=${job.jobLat}%2C${job.jobLng}`}
            className="w-full h-full border-0 pointer-events-none opacity-85"
          />
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold text-[#14201A] shadow-md flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#0B6B3A]" />
            <span>{job.area} (Destination)</span>
          </div>
        </div>

        {/* Worker Contact Card */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#0B6B3A]/10 text-2xl flex items-center justify-center shrink-0">
                {def.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-[#14201A]">{job.workerName}</h3>
                <div className="flex items-center gap-1 text-xs font-bold text-[#F2B705]">
                  <Star className="w-3.5 h-3.5 fill-[#F2B705]" />
                  <span>4.9 Verified Artisan</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-[#6B7A72]">Agreed Price</span>
              <span className="text-xl font-black text-[#0B6B3A] block">
                ₨ {job.agreedPricePkr.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Masked Phone with Call button */}
          <div className="p-3 bg-[#F7F8F5] rounded-2xl flex items-center justify-between border border-[#E4E8E2]">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0B6B3A]" />
              <span className="text-sm font-bold text-[#14201A]">
                {showFullPhone ? job.workerPhone : '0301-***8421'}
              </span>
            </div>
            <button
              onClick={() => setShowFullPhone(!showFullPhone)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0B6B3A] text-white text-xs font-bold active:scale-95"
            >
              {showFullPhone ? 'Hide' : 'کال کریں (Call)'}
            </button>
          </div>
        </Card>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4">
        <Button size="lg" onClick={handleCompleteAndRate}>
          کام مکمل ہوا (Mark Completed & Rate)
        </Button>
      </div>

      {/* Post-Job Rating Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-5">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 text-center space-y-4">
            <h3 className="text-2xl font-black font-urdu text-[#14201A]">
              کاریگر کا کام کیسا رہا؟
            </h3>
            <p className="text-xs text-[#6B7A72]">
              Rate {job.workerName} to update their trust score
            </p>

            <div className="py-2 flex justify-center">
              <StarRating
                rating={rating}
                interactive
                size="lg"
                onChange={r => setRating(r)}
              />
            </div>

            <Button size="lg" onClick={handleConfirmRating}>
              ریٹنگ تصدیق کریں (Submit Rating)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
