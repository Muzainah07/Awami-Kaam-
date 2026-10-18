import React, { useState } from 'react';
import { WorkerProfile, SkillType } from '../../types';
import { api, SKILL_DEFINITIONS } from '../../services/api';
import { voiceService } from '../../services/voice';
import { StepIndicator } from '../ui/StepIndicator';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MicButton } from '../ui/MicButton';
import { WaveformVisualizer } from '../ui/WaveformVisualizer';
import { ShieldCheck, Volume2, Check, RotateCcw, Keyboard, CheckCircle2 } from 'lucide-react';

interface WorkerOnboardingProps {
  onComplete: (profile: WorkerProfile) => void;
}

export const WorkerOnboarding: React.FC<WorkerOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0.3);
  const [showKeyboardFallback, setShowKeyboardFallback] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Extracted Profile State
  const [extractedProfile, setExtractedProfile] = useState<WorkerProfile>({
    id: `w-${Date.now()}`,
    name: 'Ahmed Khan',
    phone: '0301-***8421',
    phoneFull: '0301-4458421',
    detected_language: 'Urdu',
    language_code: 'ur',
    primary_skill: 'painter',
    skills: ['House Painting', 'Wall Putty', 'Polish'],
    location_area: 'Liaquatabad',
    city: 'Karachi',
    latitude: 24.9080,
    longitude: 67.0435,
    availability: 'today',
    is_online: true,
    experience_years: 8,
    expected_daily_rate_pkr: 3800,
    reliability_score: 4.9,
    completed_jobs_count: 1,
    badge: 'Verified Chowk',
    avatar_color: '#0B6B3A',
    confidence: 0.98,
  });

  const speakText = (text: string) => {
    voiceService.speak(text, 'ur');
  };

  // Step 1: Voice Consent
  const handleConsentOK = () => {
    setStep(2);
    speakText('اپنا نام، کام اور علاقہ بتانے کے لیے بڑے ہرے بٹن کو دبائیں۔');
  };

  // Step 2: Voice Recording
  const handleToggleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      setIsAnalyzing(true);
      try {
        const { base64, mimeType } = await voiceService.stopRecording();
        const extracted = await api.simulateVoiceOnboarding(
          'Main Ahmed Khan hoon, Liaquatabad mein painter hoon, 8 saal ka tajurba hai.'
        );
        setExtractedProfile(prev => ({
          ...prev,
          ...extracted,
        }));
        setStep(3);
        speakText(
          `${extracted.name || 'Ahmed'} بھائی، آپ کا پروفائل بن گیا۔ لیاقت آباد، پینٹر، ۳۸۰۰ روپے۔`
        );
      } catch (e) {
        setStep(3);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      try {
        await voiceService.startRecording(level => setAudioLevel(level));
        setIsRecording(true);
      } catch {
        // Fallback for simulation
        setIsRecording(true);
        setTimeout(() => setAudioLevel(0.8), 500);
      }
    }
  };

  const handleSimulatePresetVoice = async (sampleText: string) => {
    setIsAnalyzing(true);
    const extracted = await api.simulateVoiceOnboarding(sampleText);
    setExtractedProfile(prev => ({
      ...prev,
      ...extracted,
    }));
    setIsAnalyzing(false);
    setStep(3);
    speakText('احمد بھائی، آپ کا پروفائل تیار ہو گیا ہے۔');
  };

  // Step 3: Confirm Profile
  const handleConfirmProfile = async () => {
    await api.updateWorkerProfile(extractedProfile);
    onComplete(extractedProfile);
  };

  const skillDef = SKILL_DEFINITIONS[extractedProfile.primary_skill] || SKILL_DEFINITIONS.painter;

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Top Step Indicator */}
      <div>
        <StepIndicator
          totalSteps={3}
          currentStep={step}
          labels={['آواز کی اجازت (Consent)', 'اپنا تعارف (Voice Intro)', 'تصدیق (Confirm)']}
        />

        {/* STEP 1: Consent */}
        {step === 1 && (
          <div className="mt-8 text-center animate-in fade-in">
            <div className="w-24 h-24 rounded-full bg-[#0B6B3A]/10 text-[#0B6B3A] flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-14 h-14" />
            </div>

            <h2 className="text-3xl font-extrabold text-[#14201A] font-urdu leading-tight mb-2">
              آواز کی اجازت
            </h2>
            <p className="text-sm font-semibold text-[#0B6B3A] mb-4">
              Voice Privacy & Mic Consent
            </p>

            <Card className="text-right text-[#14201A] font-urdu text-base leading-loose mb-6 bg-white border-[#E4E8E2]">
              عوامی کام میں آپ کو کچھ لکھنے یا پڑھنے کی ضرورت نہیں ہے۔ آپ کی آواز صرف آپ کا کام اور علاقہ سمجھنے کے لیے استعمال کی جائے گی۔
            </Card>

            <Button onClick={handleConsentOK} size="lg">
              ٹھیک ہے (OK, I Understand)
            </Button>
          </div>
        )}

        {/* STEP 2: Tell us about yourself */}
        {step === 2 && (
          <div className="mt-6 flex flex-col items-center text-center animate-in fade-in">
            <h2 className="text-3xl font-extrabold text-[#14201A] font-urdu leading-tight mb-1">
              اپنے بارے میں بولیں
            </h2>
            <p className="text-xs text-[#6B7A72] mb-6">
              Tap mic & speak your name, skill, and area
            </p>

            {/* Soft prompt suggestion */}
            <div className="p-3 bg-white rounded-2xl border border-[#E4E8E2] text-xs font-urdu text-[#6B7A72] mb-8 max-w-xs">
              مثال: "میں احمد ہوں، لیاقت آباد میں پینٹر ہوں..."
            </div>

            {/* Centered Mic Button */}
            <MicButton
              isRecording={isRecording}
              isLoading={isAnalyzing}
              onClick={handleToggleRecord}
              size="xl"
              labelUr={isRecording ? 'بولنا بند کریں' : 'دبا کر بولیں'}
              labelEn={isRecording ? 'Tap when finished' : 'Tap to Speak'}
            />

            {/* Waveform Visualizer */}
            {isRecording && (
              <div className="mt-4">
                <WaveformVisualizer isRecording={isRecording} audioLevel={audioLevel} />
              </div>
            )}

            {/* Quick Demo Voice Preset Chips */}
            <div className="mt-8 w-full pt-4 border-t border-[#E4E8E2]">
              <p className="text-[11px] font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
                یا فوری سیمپل آواز منتخب کریں (Demo Preset)
              </p>
              <button
                onClick={() =>
                  handleSimulatePresetVoice('Main Ahmed hoon, Liaquatabad mein house painter hoon.')
                }
                className="w-full p-3 rounded-2xl bg-white border border-[#E4E8E2] hover:border-[#0B6B3A] text-right font-urdu text-xs text-[#14201A] flex items-center justify-between"
              >
                <span className="font-sans text-[11px] font-bold text-[#0B6B3A]">🎨 1-Click Demo</span>
                <span>"میں احمد ہوں، لیاقت آباد میں پینٹر ہوں..."</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && (
          <div className="mt-6 animate-in fade-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#1F9D55]/15 text-[#1F9D55] flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#14201A] font-urdu leading-tight">
                آپ کا پروفائل تیار ہے
              </h2>
              <p className="text-xs text-[#6B7A72] mt-0.5">
                Review your profile details below
              </p>
            </div>

            {/* Profile Card */}
            <Card className="mb-6 border-2 border-[#0B6B3A]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4E8E2]">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#0B6B3A]/10 text-3xl flex items-center justify-center">
                    {skillDef.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-extrabold text-[#14201A] font-urdu leading-tight">
                      {extractedProfile.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#0B6B3A]">
                      {skillDef.labelEn} • {skillDef.labelUr}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    speakText(
                      `${extractedProfile.name} بھائی، آپ کا علاقہ ${extractedProfile.location_area} اور ریٹ ${extractedProfile.expected_daily_rate_pkr} روپے ہے۔`
                    )
                  }
                  className="p-3 rounded-2xl bg-gray-100 hover:bg-[#0B6B3A]/10 text-[#0B6B3A]"
                  title="Listen to details"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#6B7A72] font-urdu">علاقہ (Area):</span>
                  <span className="font-bold text-[#14201A]">{extractedProfile.location_area}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-[#6B7A72] font-urdu">تجربہ (Experience):</span>
                  <span className="font-bold text-[#14201A]">{extractedProfile.experience_years} سال (Years)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#6B7A72] font-urdu">توقع یومیہ اجرت:</span>
                  <span className="font-black text-lg text-[#0B6B3A]">
                    ₨ {extractedProfile.expected_daily_rate_pkr.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button onClick={handleConfirmProfile} size="lg">
                صحیح ہے ✓ (Save & Continue)
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => setStep(2)}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                دوبارہ بولیں (Speak Again)
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tiny keyboard fallback icon at very bottom */}
      {step === 2 && (
        <div className="text-center pt-4">
          {showKeyboardFallback ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="مثلاً: احمد خان، پینٹر، لیاقت آباد"
                className="flex-1 h-12 px-3 rounded-xl border border-[#E4E8E2] text-sm text-right font-urdu"
              />
              <button
                onClick={() => {
                  if (textInput.trim()) handleSimulatePresetVoice(textInput);
                }}
                className="px-4 h-12 bg-[#0B6B3A] text-white rounded-xl text-xs font-bold font-urdu"
              >
                درج کریں
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowKeyboardFallback(true)}
              className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center gap-1.5"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>کی بورڈ (Keyboard fallback)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
