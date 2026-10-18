import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Check,
  X,
  Keyboard,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { WorkerProfile, JobOffer, SkillType } from '../types';
import { SKILL_WAGE_BENCHMARKS } from '../data/seed';
import { voiceService } from '../services/voice';

interface WorkerHomeProps {
  currentWorker: WorkerProfile | null;
  onWorkerRegistered: (worker: WorkerProfile) => void;
  activeOffers: JobOffer[];
  onAcceptOffer: (offerId: string) => void;
  onDeclineOffer: (offerId: string) => void;
  onRequestConsent: () => void;
  hasConsent: boolean;
  onRequestFeedback: (offer: JobOffer) => void;
}

export const WorkerHome: React.FC<WorkerHomeProps> = ({
  currentWorker,
  onWorkerRegistered,
  activeOffers,
  onAcceptOffer,
  onDeclineOffer,
  onRequestConsent,
  hasConsent,
  onRequestFeedback,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0.2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeechText, setCurrentSpeechText] = useState<string>('');
  const [showKeyboardFallback, setShowKeyboardFallback] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [followupQuestion, setFollowupQuestion] = useState<string | null>(null);
  const [voiceAcceptedStatus, setVoiceAcceptedStatus] = useState<string | null>(null);

  // Auto-play new voice offers
  const lastPlayedOfferRef = useRef<string | null>(null);

  useEffect(() => {
    const pendingOffer = activeOffers.find(o => o.status === 'pending');
    if (pendingOffer && pendingOffer.id !== lastPlayedOfferRef.current) {
      lastPlayedOfferRef.current = pendingOffer.id;
      // Announce offer by voice
      speakMessage(pendingOffer.voice_message_ur, 'ur');
    }
  }, [activeOffers]);

  // Voice speech handler
  const speakMessage = async (text: string, lang = 'ur') => {
    setCurrentSpeechText(text);
    await voiceService.speak(
      text,
      lang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // Start Voice Recording
  const handleMicTap = async () => {
    if (!hasConsent) {
      onRequestConsent();
      return;
    }

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsProcessing(true);

      try {
        const { base64, mimeType } = await voiceService.stopRecording();
        await processWorkerAudio(base64, mimeType);
      } catch (err) {
        console.error('Recording stop error:', err);
        setIsProcessing(false);
      }
    } else {
      // Start recording
      try {
        await voiceService.startRecording(level => setAudioLevel(level));
        setIsRecording(true);
      } catch (err) {
        console.error('Recording start error:', err);
      }
    }
  };

  // Process Audio with Gemini Flash
  const processWorkerAudio = async (base64?: string, mimeType?: string, promptText?: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/gemini/worker-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType,
          textPrompt: promptText,
        }),
      });

      const data = await res.json();

      // Check if follow-up question is needed
      if (data.needs_followup && data.followup_question) {
        setFollowupQuestion(data.followup_question);
        await speakMessage(data.followup_question, 'ur');
        setIsProcessing(false);
        return;
      }

      // Profile creation success
      const skill = (data.primary_skill || 'painter') as SkillType;
      const newWorker: WorkerProfile = {
        id: `w-${Date.now()}`,
        name: data.name || 'Worker Bhai',
        phone: '0300-***1234',
        phoneFull: '0300-9871234',
        detected_language: data.detected_language || 'Urdu',
        language_code: 'ur',
        primary_skill: skill,
        skills: data.skills || [skill],
        location_area: data.location_area || 'Liaquatabad',
        city: data.city || 'Karachi',
        latitude: 24.9080,
        longitude: 67.0435,
        availability: 'today',
        experience_years: data.experience_years || 6,
        expected_daily_rate_pkr: data.expected_daily_rate_pkr || 3600,
        reliability_score: 4.8,
        completed_jobs_count: 1,
        badge: 'Verified Chowk',
        transcript_original: data.transcript_original,
        transcript_english: data.transcript_english,
        voice_intro_text: `${data.name || 'Worker'} - ${data.location_area || 'Karachi'} (${skill})`,
        avatar_color: '#0B6B3A',
        confidence: data.confidence || 0.95,
      };

      onWorkerRegistered(newWorker);
      setIsProcessing(false);
      setFollowupQuestion(null);

      // Speak confirmation back to worker in their language
      const confirmationText =
        data.voice_response_text ||
        `${newWorker.name} بھائی، آپ کا پروفائل بن گیا۔ آپ ${newWorker.location_area} میں رجسٹر ہو گئے ہیں۔`;
      speakMessage(confirmationText, 'ur');
    } catch (err) {
      console.error('Audio processing failed:', err);
      setIsProcessing(false);
    }
  };

  // Quick Dialect Simulation for Fast Hackathon Evaluation
  const handleSimulateDialect = (
    name: string,
    skill: SkillType,
    area: string,
    dialect: string,
    phrase: string
  ) => {
    processWorkerAudio(undefined, undefined, phrase);
  };

  // Voice command to accept/decline ("Haan" / "Nahi")
  const handleVoiceCommand = (command: 'accept' | 'decline', offerId: string) => {
    if (command === 'accept') {
      setVoiceAcceptedStatus('haan');
      speakMessage('آپ نے نوکری قبول کر لی ہے۔ مالک سے رابطہ کروایا جا رہا ہے۔', 'ur');
      onAcceptOffer(offerId);
    } else {
      setVoiceAcceptedStatus('nahi');
      speakMessage('نوکری مسترد کر دی گئی۔ نیا کام تلاش کیا جا رہا ہے۔', 'ur');
      onDeclineOffer(offerId);
    }
  };

  const pendingOffers = activeOffers.filter(o => o.status === 'pending');
  const acceptedOffers = activeOffers.filter(o => o.status === 'accepted');

  return (
    <div className="flex flex-col items-center justify-between min-h-[640px] w-full max-w-md mx-auto p-4 sm:p-6 bg-[#F8F9FA]">
      {/* Top Status & Audio Wave Bar */}
      <div className="w-full flex items-center justify-between py-2 border-b border-gray-200/80 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-[#0B6B3A] uppercase tracking-wide">
            Awami Kam Voice
          </span>
        </div>

        {/* Voice replay status */}
        {isSpeaking ? (
          <button
            onClick={() => voiceService.stopPlayback()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0B6B3A] text-xs font-semibold animate-pulse"
          >
            <Volume2 className="w-4 h-4" />
            <span className="font-urdu">بول رہا ہے...</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (currentWorker) {
                speakMessage(
                  `${currentWorker.name} بھائی، آپ ${currentWorker.location_area} میں پینٹر کے طور پر دستیاب ہیں۔`,
                  'ur'
                );
              } else {
                speakMessage(
                  'عوامی کام میں خوش آمدید۔ اپنا نام اور کام بتانے کے لیے بڑے ہرے بٹن کو دبائیں۔',
                  'ur'
                );
              }
            }}
            className="p-2 text-gray-500 hover:text-[#0B6B3A] rounded-full hover:bg-gray-100"
            title="Repeat voice instructions"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {/* Pending Job Offers Display - Zero-Text UI with Giant Buttons */}
        {pendingOffers.length > 0 ? (
          <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-1">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold font-urdu">
                ✨ نئی نوکری کی پیشکش! (New Job Offer)
              </span>
            </div>

            {pendingOffers.map(offer => {
              const benchmark = SKILL_WAGE_BENCHMARKS[offer.skill] || SKILL_WAGE_BENCHMARKS.laborer;
              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-3xl p-5 shadow-xl border-2 border-[#0B6B3A] relative overflow-hidden"
                >
                  {/* Underpayment Warning Banner */}
                  {offer.is_below_market && (
                    <div className="bg-rose-50 text-rose-700 p-2.5 rounded-2xl mb-3 flex items-center gap-2 text-xs font-bold border border-rose-200">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span className="font-urdu text-right w-full">
                        {offer.market_rate_warning || 'یہ ریٹ مارکیٹ سے کم ہے!'}
                      </span>
                    </div>
                  )}

                  {/* Big visual icons header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-3xl flex items-center justify-center shadow-xs">
                        {benchmark.icon}
                      </div>
                      <div>
                        <div className="text-xl font-extrabold text-gray-900 font-urdu">
                          {offer.job_title}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{offer.area}, {offer.city}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => speakMessage(offer.voice_message_ur, 'ur')}
                      className="p-3 bg-emerald-50 text-[#0B6B3A] rounded-2xl hover:bg-emerald-100 active:scale-95 transition-all shadow-xs"
                      title="Replay Voice Note"
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Giant Rupee Wage Display */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 mb-5 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      مزدوری / Daily Wage
                    </span>
                    <span className="text-2xl font-black text-[#0B6B3A]">
                      ₨ {offer.rate_pkr.toLocaleString()}
                    </span>
                  </div>

                  {/* Voice command prompt */}
                  <p className="text-center text-xs font-urdu text-gray-500 mb-3">
                    آواز سے بھی بول سکتے ہیں: "ہاں" (قبول) یا "نہیں" (مسترد)
                  </p>

                  {/* Two Giant Action Buttons (Accept & Decline, min 64px touch target) */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Giant Red Cross Decline */}
                    <button
                      onClick={() => handleVoiceCommand('decline', offer.id)}
                      className="h-18 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
                    >
                      <X className="w-8 h-8 stroke-[3]" />
                      <span className="font-urdu">نہیں</span>
                    </button>

                    {/* Giant Green Tick Accept */}
                    <button
                      onClick={() => handleVoiceCommand('accept', offer.id)}
                      className="h-18 rounded-2xl bg-[#0B6B3A] hover:bg-[#09572e] active:scale-95 text-white font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-[#0B6B3A]/30 transition-all"
                    >
                      <Check className="w-8 h-8 stroke-[3]" />
                      <span className="font-urdu">ہاں (قبول)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : acceptedOffers.length > 0 ? (
          /* Accepted Job Card with Completion & Feedback Trigger */
          <div className="w-full space-y-4 animate-in fade-in duration-300">
            <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-xl text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-2 text-white" />
              <h3 className="text-2xl font-extrabold font-urdu">نوکری منظور ہو گئی!</h3>
              <p className="text-emerald-100 text-sm mt-1">
                Job Confirmed. Contact hirer & dispatch to site.
              </p>

              <div className="bg-white/10 rounded-2xl p-3 mt-4 text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Kam:</span>
                  <span className="font-bold">{acceptedOffers[0].job_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Ilaqa:</span>
                  <span className="font-bold">{acceptedOffers[0].area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Mazdoori:</span>
                  <span className="font-bold text-amber-300 text-sm">
                    ₨ {acceptedOffers[0].rate_pkr.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Complete & Rate Button */}
              <button
                onClick={() => onRequestFeedback(acceptedOffers[0])}
                className="w-full mt-5 py-3.5 bg-white text-[#0B6B3A] font-bold rounded-2xl hover:bg-emerald-50 active:scale-95 transition-all text-sm shadow-md"
              >
                کام ختم ہوا؟ آواز سے ریویو دیں (Complete & Rate)
              </button>
            </div>
          </div>
        ) : (
          /* Default Worker Home: HUGE PULSING GREEN MIC BUTTON (Zero-Text UI) */
          <div className="flex flex-col items-center text-center">
            {/* Visual Header / Greeting */}
            {currentWorker ? (
              <div className="mb-6 p-4 bg-white rounded-3xl border border-gray-200/80 shadow-xs w-full max-w-xs">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xs"
                    style={{ backgroundColor: currentWorker.avatar_color }}
                  >
                    {SKILL_WAGE_BENCHMARKS[currentWorker.primary_skill]?.icon || '👷'}
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-gray-900 leading-tight">
                      {currentWorker.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-urdu">
                      {currentWorker.location_area} • {SKILL_WAGE_BENCHMARKS[currentWorker.primary_skill]?.labelUr}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
                    موجود
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-[#0B6B3A] rounded-full text-xs font-bold font-urdu mb-2">
                  عوامی کام • مزدور پورٹل
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 font-urdu leading-relaxed">
                  صرف بولیں، پڑھنے کی ضرورت نہیں
                </h2>
              </div>
            )}

            {/* Follow-up question banner if AI asked */}
            {followupQuestion && (
              <div className="w-full max-w-xs bg-amber-50 border border-amber-200 p-3 rounded-2xl mb-4 text-amber-900 text-xs font-urdu text-right">
                <p className="font-bold">سوال:</p>
                <p>{followupQuestion}</p>
              </div>
            )}

            {/* Giant Pulsing Green Button (180px) */}
            <div className="relative my-4">
              <button
                onClick={handleMicTap}
                disabled={isProcessing}
                className={`w-44 h-44 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center text-white transition-all transform active:scale-95 shadow-2xl relative ${
                  isRecording
                    ? 'bg-rose-600 ring-12 ring-rose-300 animate-pulse'
                    : isProcessing
                    ? 'bg-amber-500 animate-spin'
                    : 'bg-[#0B6B3A] hover:bg-[#08552e] mic-pulse'
                }`}
                aria-label="Tap to speak"
              >
                {isProcessing ? (
                  <Sparkles className="w-16 h-16 animate-bounce" />
                ) : isRecording ? (
                  <MicOff className="w-16 h-16" />
                ) : (
                  <Mic className="w-16 h-16" />
                )}
                <span className="text-sm font-bold font-urdu mt-2">
                  {isProcessing
                    ? 'سوچ رہا ہے...'
                    : isRecording
                    ? 'بولیں...'
                    : 'دبا کر بولیں'}
                </span>
              </button>

              {/* Dynamic waveform visualizer when recording */}
              {isRecording && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 h-6">
                  {[20, 50, 90, 40, 70, 100, 60, 30, 85].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#0B6B3A] rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(6, h * audioLevel)}px`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Dialect Simulation Chips for Quick Testing */}
            <div className="mt-8 w-full max-w-xs">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
                فوری زبان کا نمونہ دبائیں (Quick Dialect Test Chips)
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() =>
                    handleSimulateDialect(
                      'Ahmed',
                      'painter',
                      'Liaquatabad',
                      'Urdu',
                      'Main Ahmed hoon, Liaquatabad mein house painter hoon, aaj available hoon.'
                    )
                  }
                  className="p-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all"
                >
                  <div className="font-bold text-[#0B6B3A]">🎨 اردو: احمد</div>
                  <div className="text-[10px] text-gray-500">پینٹر • لیاقت آباد</div>
                </button>

                <button
                  onClick={() =>
                    handleSimulateDialect(
                      'Bashir',
                      'plumber',
                      'Gulshan-e-Iqbal',
                      'Punjabi',
                      'ਮੈਂ ਬਸ਼ੀਰ ਹਾਂ, ਗੁلਸ਼ਨ اقبال چ پلنبر دا کم کرنا آں، اج وہلا واں۔'
                    )
                  }
                  className="p-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all"
                >
                  <div className="font-bold text-blue-600">🔧 پنجابی: بشیر</div>
                  <div className="text-[10px] text-gray-500">پلمبر • گلشن اقبال</div>
                </button>

                <button
                  onClick={() =>
                    handleSimulateDialect(
                      'Gul Khan',
                      'electrician',
                      'Saddar',
                      'Pashto',
                      'زه ګل خان یم، صدر کښې د برېښنا (الیکٹریشن) کار کوم، نن تیار یم۔'
                    )
                  }
                  className="p-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all"
                >
                  <div className="font-bold text-orange-600">⚡ پښتو: ګل خان</div>
                  <div className="text-[10px] text-gray-500">الیکٹریشن • صدر</div>
                </button>

                <button
                  onClick={() =>
                    handleSimulateDialect(
                      'Nawaz',
                      'mason',
                      'Orangi Town',
                      'Sindhi',
                      'مان نواز علي آھيان، اورنگي ٽائون ۾ راڄ مستري جو ڪم ڪندو آھيان۔'
                    )
                  }
                  className="p-2 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all"
                >
                  <div className="font-bold text-amber-600">🧱 سنڌي: نواز</div>
                  <div className="text-[10px] text-gray-500">راج مستری • اورنگی</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Keyboard Fallback Input */}
      <div className="w-full pt-3 flex flex-col items-center">
        {showKeyboardFallback ? (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (textInput.trim()) {
                processWorkerAudio(undefined, undefined, textInput);
                setTextInput('');
              }
            }}
            className="w-full flex gap-2 animate-in fade-in"
          >
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="مثلاً: میں ارشد کارپینٹر ہوں، گلشن اقبال..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B6B3A] font-urdu text-right"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#0B6B3A] text-white rounded-xl text-xs font-bold font-urdu"
            >
              بھیجیں
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowKeyboardFallback(true)}
            className="p-2 text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1.5 transition-all"
            title="Text keyboard fallback"
          >
            <Keyboard className="w-4 h-4" />
            <span>کی بورڈ (Keyboard Fallback)</span>
          </button>
        )}
      </div>
    </div>
  );
};
