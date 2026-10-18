import React, { useState } from 'react';
import { JobBookingRequest, SkillType } from '../../types';
import { api, SKILL_DEFINITIONS, KARACHI_AREAS } from '../../services/api';
import { voiceService } from '../../services/voice';
import { StepIndicator } from '../ui/StepIndicator';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Badge } from '../ui/Badge';
import {
  Mic,
  Calendar,
  Clock,
  Plus,
  Minus,
  Sparkles,
  AlertTriangle,
  MapPin,
  Check,
  Search,
  ChevronLeft,
} from 'lucide-react';

interface HirerBookWizardProps {
  onComplete: (request: JobBookingRequest) => void;
  onCancel: () => void;
}

export const HirerBookWizard: React.FC<HirerBookWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Booking Form State
  const [selectedSkill, setSelectedSkill] = useState<SkillType>('painter');
  const [selectedArea, setSelectedArea] = useState('Gulshan-e-Iqbal');
  const [areaSearch, setAreaSearch] = useState('');
  const [dateOption, setDateOption] = useState<'today' | 'tomorrow' | 'pick_date'>('today');
  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'anytime'>('morning');
  const [sizeAmount, setSizeAmount] = useState(2);
  const [workersCount, setWorkersCount] = useState(1);
  const [note, setNote] = useState('');
  const [offeredPrice, setOfferedPrice] = useState(3800);
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [isParsingNatural, setIsParsingNatural] = useState(false);

  const handleParseNaturalInput = async () => {
    if (!naturalPrompt.trim()) return;
    setIsParsingNatural(true);
    try {
      const res = await fetch('/api/gemini/hirer-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textPrompt: naturalPrompt }),
      });
      const data = await res.json();
      if (data.skill_needed) setSelectedSkill(data.skill_needed);
      if (data.area) setSelectedArea(data.area);
      if (data.offered_rate_pkr) setOfferedPrice(data.offered_rate_pkr);
      if (data.title) setNote(data.title);
      setStep(4);
    } catch {
      setStep(2);
    } finally {
      setIsParsingNatural(false);
    }
  };

  const currentDef = SKILL_DEFINITIONS[selectedSkill];
  const fairPrice = api.calculateFairPrice(selectedSkill, sizeAmount, selectedArea);
  const isBelowFair = offeredPrice < fairPrice.minPkr;

  const handleVoiceDescribe = async () => {
    setIsVoiceRecording(true);
    try {
      await voiceService.startRecording();
      setTimeout(async () => {
        setIsVoiceRecording(false);
        voiceService.stopRecording().catch(() => {});
        setSelectedSkill('painter');
        setSelectedArea('Gulshan-e-Iqbal');
        setSizeAmount(2);
        setOfferedPrice(3800);
        setStep(4);
      }, 3500);
    } catch {
      setIsVoiceRecording(false);
    }
  };

  const filteredAreas = KARACHI_AREAS.filter(a =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full sm:h-[88dvh] w-full max-w-2xl mx-auto bg-white sm:rounded-3xl sm:shadow-2xl sm:border sm:border-gray-100 overflow-hidden relative">
      {/* Top Header with Back / Cancel and Step Indicator */}
      <div className="flex-none p-5 pb-3 border-b border-gray-100 bg-white z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={step === 1 ? onCancel : () => setStep(s => Math.max(1, s - 1) as 1 | 2 | 3 | 4 | 5)}
            className="h-10 px-3 -ml-3 rounded-xl flex items-center gap-1 text-xs font-bold text-[#6B7A72] hover:text-[#14201A] hover:bg-black/5 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>
          <span className="text-xs font-bold text-[#0B6B3A]">
            Awami Booking • Step {step} of 5
          </span>
        </div>

        <StepIndicator
          totalSteps={5}
          currentStep={step}
          labels={['Skill Needed', 'Location & Time', 'Job Details', 'Fair Price Offer', 'Confirm & Request']}
        />
      </div>

      {/* Main Content Area (Scrollable with proper padding) */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">

        {/* STEP 1: What do you need? (8 tiles + voice option) */}
        {step === 1 && (
          <div className="mt-3 animate-in fade-in space-y-4">
            <div>
              <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
                آپ کو کس کاریگر کی ضرورت ہے؟
              </h2>
              <p className="text-xs text-[#6B7A72]">Select a skill or describe by voice</p>
            </div>

            {/* Voice Booking Banner */}
            <button
              onClick={handleVoiceDescribe}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between min-h-[64px] ${
                isVoiceRecording
                  ? 'border-[#D64545] bg-[#D64545]/10 animate-pulse'
                  : 'border-[#0B6B3A] bg-[#0B6B3A]/5 hover:bg-[#0B6B3A]/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
                    isVoiceRecording ? 'bg-[#D64545]' : 'bg-[#0B6B3A]'
                  }`}
                >
                  <Mic className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-urdu font-bold text-sm text-[#14201A]">
                    {isVoiceRecording ? 'سن رہا ہوں...' : 'آواز سے بتائیں (Voice Booking)'}
                  </div>
                  <div className="text-xs text-[#6B7A72]">
                    "Mujhe 2 kamre paint karwane hain..."
                  </div>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-[#F2B705] shrink-0" />
            </button>

            {/* Natural Language Job Description Box */}
            <div className="bg-[#0B6B3A]/5 border border-[#0B6B3A]/20 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B6B3A]">
                <Sparkles className="w-4 h-4 text-[#F2B705]" />
                <span>اپنے الفاظ میں بتائیں (Describe what worker you need in Urdu or English)</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={naturalPrompt}
                  onChange={e => setNaturalPrompt(e.target.value)}
                  placeholder="مثلاً: گلشن اقبال میں 2 کمرے پینٹ کروانے ہیں..."
                  className="flex-1 h-12 px-4 rounded-xl border border-[#E4E8E2] bg-white text-xs font-urdu text-[#14201A] focus:outline-hidden focus:border-[#0B6B3A]"
                />
                <button
                  type="button"
                  onClick={handleParseNaturalInput}
                  disabled={isParsingNatural || !naturalPrompt.trim()}
                  className="px-4 h-12 bg-[#0B6B3A] text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 active:scale-95 disabled:opacity-50"
                >
                  {isParsingNatural ? 'تجزیہ...' : 'AI سے تلاش'}
                </button>
              </div>
            </div>

            {/* Grid of 8 Big Skill Tiles (Min 56px touch target: 112px tall cards) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {Object.values(SKILL_DEFINITIONS).slice(0, 8).map(skill => {
                const isSelected = selectedSkill === skill.id;
                return (
                  <button
                    key={skill.id}
                    onClick={() => {
                      setSelectedSkill(skill.id);
                      setOfferedPrice(skill.baseAvgRate);
                    }}
                    className={`p-4 rounded-[20px] border-2 text-left transition-all duration-200 select-none flex flex-col justify-between h-28 ${
                      isSelected
                        ? 'border-[#0B6B3A] bg-[#0B6B3A]/5 shadow-xs'
                        : 'border-[#E4E8E2] bg-white hover:border-[#0B6B3A]/40'
                    }`}
                  >
                    <span className="text-3xl">{skill.icon}</span>
                    <div>
                      <span className="font-urdu font-bold text-base block text-[#14201A] leading-tight">
                        {skill.labelUr}
                      </span>
                      <span className="text-xs font-semibold text-[#6B7A72]">
                        {skill.labelEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Where and when? */}
        {step === 2 && (
          <div className="mt-3 animate-in fade-in space-y-4">
            <div>
              <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
                کام کا علاقہ اور وقت
              </h2>
              <p className="text-xs text-[#6B7A72]">Where and when is the job required?</p>
            </div>

            {/* Area Search */}
            <div>
              <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
                علاقہ منتخب کریں (Location in Karachi)
              </label>
              <div className="relative mb-2">
                <Search className="w-4 h-4 absolute left-3.5 top-4 text-[#6B7A72]" />
                <input
                  type="text"
                  value={areaSearch}
                  onChange={e => setAreaSearch(e.target.value)}
                  placeholder="تلاش کریں: Gulshan, Saddar, Clifton..."
                  className="w-full h-14 pl-10 pr-4 rounded-2xl border border-[#E4E8E2] text-sm focus:outline-hidden focus:border-[#0B6B3A]"
                />
              </div>

              {/* Area suggestions chips */}
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pt-1">
                {filteredAreas.slice(0, 8).map(area => (
                  <Chip
                    key={area}
                    label={area}
                    selected={selectedArea === area}
                    onClick={() => setSelectedArea(area)}
                  />
                ))}
              </div>
            </div>

            {/* Date chips row */}
            <div>
              <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
                تاریخ (Date)
              </label>
              <div className="flex gap-2">
                <Chip
                  label="Today"
                  labelUr="آج"
                  selected={dateOption === 'today'}
                  onClick={() => setDateOption('today')}
                />
                <Chip
                  label="Tomorrow"
                  labelUr="کل"
                  selected={dateOption === 'tomorrow'}
                  onClick={() => setDateOption('tomorrow')}
                />
                <Chip
                  label="Pick Date"
                  labelUr="دیگر"
                  selected={dateOption === 'pick_date'}
                  onClick={() => setDateOption('pick_date')}
                />
              </div>
            </div>

            {/* Time slot chips row */}
            <div>
              <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
                وقت (Time Slot)
              </label>
              <div className="flex gap-2">
                <Chip
                  label="Morning"
                  labelUr="صبح ۸ سے ۱۲"
                  selected={timeSlot === 'morning'}
                  onClick={() => setTimeSlot('morning')}
                />
                <Chip
                  label="Afternoon"
                  labelUr="دوپہر ۱۲ سے ۴"
                  selected={timeSlot === 'afternoon'}
                  onClick={() => setTimeSlot('afternoon')}
                />
                <Chip
                  label="Anytime"
                  labelUr="کسی بھی وقت"
                  selected={timeSlot === 'anytime'}
                  onClick={() => setTimeSlot('anytime')}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Job Details */}
        {step === 3 && (
          <div className="mt-3 animate-in fade-in space-y-4">
            <div>
              <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
                کام کا حجم اور کاریگر
              </h2>
              <p className="text-xs text-[#6B7A72]">Define scope and team size</p>
            </div>

            {/* Scope Stepper */}
            <Card className="p-4 flex items-center justify-between min-h-[64px]">
              <div>
                <span className="font-urdu text-base font-bold text-[#14201A] block">
                  کام کا حجم ({currentDef.unit})
                </span>
                <span className="text-xs text-[#6B7A72]">
                  Number of {currentDef.unit} to work on
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSizeAmount(s => Math.max(1, s - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center font-bold text-xl"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-black w-8 text-center">{sizeAmount}</span>
                <button
                  type="button"
                  onClick={() => setSizeAmount(s => s + 1)}
                  className="w-12 h-12 rounded-xl bg-[#0B6B3A]/10 hover:bg-[#0B6B3A]/20 active:scale-95 text-[#0B6B3A] flex items-center justify-center font-bold text-xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </Card>

            {/* Workers Count Stepper */}
            <Card className="p-4 flex items-center justify-between min-h-[64px]">
              <div>
                <span className="font-urdu text-base font-bold text-[#14201A] block">
                  کاریگروں کی تعداد
                </span>
                <span className="text-xs text-[#6B7A72]">Workers needed</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWorkersCount(w => Math.max(1, w - 1))}
                  className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center font-bold text-xl"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-black w-8 text-center">{workersCount}</span>
                <button
                  type="button"
                  onClick={() => setWorkersCount(w => w + 1)}
                  className="w-12 h-12 rounded-xl bg-[#0B6B3A]/10 hover:bg-[#0B6B3A]/20 active:scale-95 text-[#0B6B3A] flex items-center justify-center font-bold text-xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </Card>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
                اضافی ہدایت (Optional Note for Worker)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="مثال: سامان اور سیڑھی موجود ہے..."
                className="w-full p-3.5 rounded-2xl border border-[#E4E8E2] text-sm focus:outline-hidden focus:border-[#0B6B3A] font-urdu text-right"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Price (The inDrive Moment!) */}
        {step === 4 && (
          <div className="mt-3 animate-in fade-in space-y-4">
            <div>
              <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
                اپنی پیشکش طے کریں (Your Price Offer)
              </h2>
              <p className="text-xs text-[#6B7A72]">
                Set your price like inDrive. Workers can accept or counter.
              </p>
            </div>

            {/* Big Price Card */}
            <Card className="text-center p-6 border-2 border-[#0B6B3A]">
              <span className="text-xs font-bold text-[#6B7A72] font-urdu block">
                آپ کی پیشکش (Offered Daily Wage)
              </span>

              <div className="flex items-center justify-center gap-6 my-4">
                <button
                  type="button"
                  onClick={() => setOfferedPrice(p => Math.max(1500, p - 100))}
                  className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-2xl active:scale-95"
                >
                  <Minus className="w-6 h-6" />
                </button>

                <div className="text-4xl font-black text-[#0B6B3A] tracking-tight">
                  ₨ {offeredPrice.toLocaleString()}
                </div>

                <button
                  type="button"
                  onClick={() => setOfferedPrice(p => p + 100)}
                  className="w-14 h-14 rounded-2xl bg-[#0B6B3A]/10 text-[#0B6B3A] hover:bg-[#0B6B3A]/20 flex items-center justify-center font-bold text-2xl active:scale-95"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* Horizontal Slider with Green Fair Zone */}
              <div className="space-y-1 mb-2">
                <input
                  type="range"
                  min={2000}
                  max={6500}
                  step={100}
                  value={offeredPrice}
                  onChange={e => setOfferedPrice(parseInt(e.target.value))}
                  className="w-full accent-[#0B6B3A] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#6B7A72] font-bold">
                  <span>₨ 2,000</span>
                  <span className="text-[#0B6B3A]">
                    Fair Zone: ₨ {fairPrice.minPkr.toLocaleString()} - {fairPrice.maxPkr.toLocaleString()}
                  </span>
                  <span>₨ 6,500</span>
                </div>
              </div>
            </Card>

            {/* AI Fair Wage Engine Card */}
            <div className="p-4 rounded-2xl bg-[#0B6B3A]/5 border border-[#0B6B3A]/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B6B3A]">
                  <Sparkles className="w-4 h-4 text-[#F2B705]" />
                  <span>AI Fair Wage Engine</span>
                </div>
                <Badge variant={isBelowFair ? 'warning' : 'fair'}>
                  {isBelowFair ? 'Below Market' : 'Fair Offer'}
                </Badge>
              </div>

              <p className="text-xs text-[#14201A] font-semibold leading-relaxed">
                AI says: <strong>₨ {fairPrice.minPkr.toLocaleString()} to {fairPrice.maxPkr.toLocaleString()} PKR</strong> for {workersCount} {currentDef.labelEn}, {sizeAmount} {currentDef.unit} in {selectedArea}.
              </p>

              {isBelowFair && (
                <div className="pt-2 border-t border-[#E4E8E2] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#946800] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    May receive slow response
                  </span>
                  <button
                    onClick={() => setOfferedPrice(fairPrice.recommendedPkr)}
                    className="px-3 py-1.5 bg-[#0B6B3A] text-white text-xs font-bold rounded-xl active:scale-95"
                  >
                    Raise to ₨ {fairPrice.recommendedPkr.toLocaleString()}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <div className="mt-3 animate-in fade-in space-y-4">
            <div>
              <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
                آرڈر کا جائزہ لیں (Review Request)
              </h2>
              <p className="text-xs text-[#6B7A72]">Confirm your order details before broadcasting</p>
            </div>

            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E2]">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{currentDef.icon}</span>
                  <div>
                    <h3 className="text-lg font-black text-[#14201A] font-urdu">
                      {currentDef.labelUr}
                    </h3>
                    <span className="text-xs font-semibold text-[#6B7A72]">{currentDef.labelEn}</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-[#0B6B3A]">
                  ₨ {offeredPrice.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#6B7A72]">Location:</span>
                  <span className="font-bold text-[#14201A]">{selectedArea}, Karachi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#6B7A72]">Date & Time:</span>
                  <span className="font-bold text-[#14201A] capitalize">{dateOption} ({timeSlot})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#6B7A72]">Scope:</span>
                  <span className="font-bold text-[#14201A]">{sizeAmount} {currentDef.unit} • {workersCount} Worker</span>
                </div>
                {note && (
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B7A72]">Note:</span>
                    <span className="font-medium text-[#14201A] font-urdu">{note}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM ACTION FOOTER (Guaranteed zero overlap, perfect scrolling) */}
      <div className="flex-none sticky bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 shadow-2xl z-20">
        {step < 5 ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setStep(s => Math.min(5, s + 1) as 1 | 2 | 3 | 4 | 5)}
          >
            آگے بڑھیں (Continue)
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              onComplete({
                skill: selectedSkill,
                area: selectedArea,
                city: 'Karachi',
                dateOption,
                timeSlot,
                sizeAmount,
                sizeUnit: currentDef.unit,
                workersCount,
                note,
                offeredPricePkr: offeredPrice,
              })
            }
          >
            کاریگر تلاش کریں (Find Workers)
          </Button>
        )}
      </div>
    </div>
  );
};
