import React, { useState } from 'react';
import { WorkerProfile, LanguageCode } from '../../types';
import { api, SKILL_DEFINITIONS, KARACHI_AREAS } from '../../services/api';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Chip } from '../ui/Chip';
import { Button } from '../ui/Button';
import {
  Globe,
  Gauge,
  HelpCircle,
  LogOut,
  ArrowLeftRight,
  ShieldCheck,
  AlertCircle,
  MapPin,
} from 'lucide-react';

interface WorkerProfileTabProps {
  worker: WorkerProfile;
  onLogout: () => void;
  onSwitchAccount: () => void;
}

export const WorkerProfileTab: React.FC<WorkerProfileTabProps> = ({
  worker,
  onLogout,
  onSwitchAccount,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(worker.language_code || 'ur');
  const [voiceSpeed, setVoiceSpeed] = useState<'normal' | 'slow' | 'fast'>('normal');
  const [currentArea, setCurrentArea] = useState(worker.location_area || 'Liaquatabad');
  const [savingLocation, setSavingLocation] = useState(false);

  const handleUpdateLocation = async (area: string) => {
    setCurrentArea(area);
    setSavingLocation(true);
    try {
      const updated = { ...worker, location_area: area };
      await api.updateWorkerProfile(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingLocation(false);
    }
  };

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'ur', label: 'Urdu', native: 'اردو' },
    { code: 'pa', label: 'Punjabi', native: 'پنجابی' },
    { code: 'ps', label: 'Pashto', native: 'پښتو' },
    { code: 'sd', label: 'Sindhi', native: 'سنڌي' },
    { code: 'en', label: 'English', native: 'English' },
  ];

  const skillDef = SKILL_DEFINITIONS[worker.primary_skill] || SKILL_DEFINITIONS.painter;

  return (
    <div className="flex-1 p-5 pb-24 max-w-md mx-auto w-full space-y-4 animate-in fade-in">
      {/* 1. Worker Identity Card */}
      <Card className="text-center p-6 bg-white">
        <div className="mx-auto mb-3 flex justify-center">
          <Avatar
            name={worker.name}
            size="xl"
            iconEmoji={skillDef.icon}
            bgColor="#0B6B3A"
          />
        </div>
        <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
          {worker.name}
        </h2>
        <p className="text-sm font-bold text-[#0B6B3A] mt-0.5">
          {skillDef.labelEn} • {currentArea}, Karachi
        </p>

        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="px-3 py-1 rounded-full bg-[#0B6B3A]/10 text-[#0B6B3A] text-xs font-bold">
            {worker.badge}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-[#6B7A72] text-xs font-semibold">
            {worker.experience_years} سال تجربہ
          </span>
        </div>
      </Card>

      {/* 2. Custom Work Location Area Selection (Wherever worker wants to work) */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B7A72] uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#0B6B3A]" />
            <span>کام کا علاقہ منتخب کریں (My Work Location)</span>
          </div>
          {savingLocation && <span className="text-[10px] text-[#0B6B3A] font-bold">محفوظ ہو رہا ہے...</span>}
        </div>
        <p className="text-xs text-[#6B7A72]">
          جہاں چاہیں کام کریں — آپ جس علاقے کا انتخاب کریں گے، وہیں کے نوٹیفیکیشنز ملیں گے۔
        </p>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pt-1">
          {KARACHI_AREAS.map(area => (
            <Chip
              key={area}
              label={area}
              selected={currentArea === area}
              onClick={() => handleUpdateLocation(area)}
            />
          ))}
        </div>
      </Card>

      {/* 2. Flag-Free Language Chips (Min 56px touch target: size="lg") */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#6B7A72] uppercase tracking-wider">
          <Globe className="w-4 h-4 text-[#0B6B3A]" />
          <span>آواز کی زبان (Voice Language)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.map(lang => (
            <Chip
              key={lang.code}
              size="lg"
              label={lang.label}
              labelUr={lang.native}
              selected={selectedLanguage === lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
            />
          ))}
        </div>
      </Card>

      {/* 3. Voice Speed Setting (Touch target 56px: h-14) */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#6B7A72] uppercase tracking-wider">
          <Gauge className="w-4 h-4 text-[#0B6B3A]" />
          <span>آواز کی رفتار (Speech Speed)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['slow', 'normal', 'fast'] as const).map(speed => (
            <button
              key={speed}
              type="button"
              onClick={() => setVoiceSpeed(speed)}
              className={`h-14 rounded-2xl text-xs font-bold border transition-all ${
                voiceSpeed === speed
                  ? 'bg-[#0B6B3A] border-[#0B6B3A] text-white shadow-xs'
                  : 'bg-white border-[#E4E8E2] text-[#14201A] hover:bg-gray-50'
              }`}
            >
              {speed === 'slow' ? 'آہستہ (Slow)' : speed === 'normal' ? 'عام (Normal)' : 'تیز (Fast)'}
            </button>
          ))}
        </div>
      </Card>

      {/* 4. Help & Support Link (h-14, 56px target) */}
      <Card
        className="flex items-center justify-between p-4 min-h-[56px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-[#6B7A72] shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#14201A] font-urdu leading-tight">
              مدد اور ہیلپ لائن (Worker Support)
            </h4>
            <p className="text-xs text-[#6B7A72]">Free 24/7 worker helpline</p>
          </div>
        </div>
        <span className="text-sm font-bold text-[#0B6B3A] shrink-0">021-111</span>
      </Card>

      {/* 4. Account Actions: Switch Account, Sign Out, Delete Account */}
      <div className="space-y-3 pt-2">
        {/* Phone Verification Status (Demo Note) */}
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-xs text-amber-800 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{worker.phone_verified ? "Phone verified" : "Phone not verified (demo)"}</span>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={onSwitchAccount}
          icon={<ArrowLeftRight className="w-4 h-4" />}
        >
          اکاؤنٹ تبدیل کریں (Switch Account)
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={onLogout}
          icon={<LogOut className="w-4 h-4 text-[#6B7A72]" />}
          className="text-[#6B7A72] hover:bg-gray-100"
        >
          لاگ آؤٹ (Log out)
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={async () => { if(confirm('Are you sure you want to delete your account?')) { await api.deleteAccount(); onLogout(); } }}
          icon={<AlertCircle className="w-4 h-4 text-[#D64545]" />}
          className="text-[#D64545] hover:bg-[#D64545]/5"
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
};
