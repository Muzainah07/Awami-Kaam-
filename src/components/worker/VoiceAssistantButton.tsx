import React, { useState, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2, Check, X, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { voiceService } from '../../services/voice';

interface VoiceAssistantButtonProps {
  onStateChangeRequested?: (intent: string, value?: number) => void;
}

export const VoiceAssistantButton: React.FC<VoiceAssistantButtonProps> = ({
  onStateChangeRequested,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseCard, setResponseCard] = useState<{
    reply_ur: string;
    reply_en: string;
    requires_confirmation: boolean;
    confirmation_prompt_ur?: string;
    intent?: string;
    extracted_value?: number;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startListening = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsListening(true);
      voiceService.speak('سن رہا ہوں...', 'ur');
    } catch (err) {
      console.error('Microphone error:', err);
      handleTextQuery('آج کا کیا کام ہے؟');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string)?.split(',')[1];
        const res = await api.invokeVoiceAssistant({ audio_base64: base64Audio });
        handleAssistantResponse(res);
      };
    } catch (err) {
      console.error('Voice processing error:', err);
      setIsProcessing(false);
    }
  };

  const handleTextQuery = async (queryText: string) => {
    setIsProcessing(true);
    try {
      const res = await api.invokeVoiceAssistant({ transcript_text: queryText });
      handleAssistantResponse(res);
    } catch (err) {
      console.error('Text query error:', err);
      setIsProcessing(false);
    }
  };

  const handleAssistantResponse = (res: any) => {
    setIsProcessing(false);
    setResponseCard(res);
    if (res?.reply_ur) {
      voiceService.speak(res.reply_ur, 'ur');
    }
  };

  const handleConfirmAction = () => {
    if (responseCard && onStateChangeRequested && responseCard.intent) {
      onStateChangeRequested(responseCard.intent, responseCard.extracted_value);
    }
    setResponseCard(null);
  };

  return (
    <>
      <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end">
        {responseCard && (
          <div className="mb-3 bg-white border border-[#0B6B3A]/20 shadow-xl rounded-2xl p-4 max-w-xs animate-in slide-in-from-bottom-3 w-72">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#0B6B3A] font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Awami AI Voice</span>
              </div>
              <button
                onClick={() => setResponseCard(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-bold text-[#14201A] font-urdu mb-1 leading-snug">
              {responseCard.reply_ur}
            </p>
            <p className="text-xs text-[#6B7A72] mb-3">{responseCard.reply_en}</p>

            {responseCard.requires_confirmation ? (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={handleConfirmAction}
                  className="flex-1 bg-[#0B6B3A] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md hover:bg-[#09572f]"
                >
                  <Check className="w-4 h-4" /> ہاں (Yes)
                </button>
                <button
                  onClick={() => setResponseCard(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-200"
                >
                  <X className="w-4 h-4" /> نہیں (No)
                </button>
              </div>
            ) : (
              <button
                onClick={() => voiceService.speak(responseCard.reply_ur, 'ur')}
                className="w-full bg-[#0B6B3A]/10 text-[#0B6B3A] py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" /> دوبارہ سنیں (Replay)
              </button>
            )}
          </div>
        )}

        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
            isListening
              ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300'
              : 'bg-[#0B6B3A] text-white hover:bg-[#09572f]'
          }`}
          title="Voice Assistant"
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>
    </>
  );
};
