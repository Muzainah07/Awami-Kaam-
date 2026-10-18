/**
 * Voice recording, Web Audio analysis, and speech playback utility
 */

class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  /**
   * Request microphone permission and initialize stream
   */
  async requestMicPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release initial probe stream
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.warn('Microphone permission denied or unsupported:', err);
      return false;
    }
  }

  /**
   * Start recording audio from user microphone with real-time waveform data
   */
  async startRecording(onAudioLevel?: (level: number) => void): Promise<void> {
    this.stopPlayback();
    this.audioChunks = [];

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.micStream = stream;

    // Set up Web Audio Analyser for live visualizer
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      source.connect(this.analyserNode);

      if (onAudioLevel) {
        const bufferLength = this.analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevel = () => {
          if (!this.analyserNode || !this.micStream) return;
          this.analyserNode.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength; // 0 to 255
          const normalized = Math.min(1.0, avg / 128);
          onAudioLevel(normalized);

          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            requestAnimationFrame(updateLevel);
          }
        };
        requestAnimationFrame(updateLevel);
      }
    } catch (e) {
      console.warn('AudioContext visualization setup failed:', e);
    }

    // Determine supported mime type
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      mimeType = 'audio/ogg';
    }

    this.mediaRecorder = new MediaRecorder(stream, { mimeType });

    this.mediaRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
  }

  /**
   * Stop recording and return base64 encoded audio with mimeType
   */
  async stopRecording(): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('MediaRecorder not initialized'));
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });

          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const result = reader.result as string;
            // Extract base64 without prefix data:...;base64,
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            
            // Clean up microphone tracks
            if (this.micStream) {
              this.micStream.getTracks().forEach(t => t.stop());
              this.micStream = null;
            }
            if (this.audioContext && this.audioContext.state !== 'closed') {
              this.audioContext.close().catch(() => {});
              this.audioContext = null;
            }

            resolve({ base64, mimeType });
          };
          reader.onerror = error => reject(error);
        } catch (e) {
          reject(e);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Play speech using Gemini TTS (WAV) if available, falling back to browser SpeechSynthesis
   */
  async speak(
    text: string,
    langCode: string = 'ur',
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stopPlayback();

    // 1. Try server Gemini TTS endpoint
    try {
      const res = await fetch('/api/gemini/voice-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: langCode }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
          this.currentAudioElement = audio;

          audio.onplay = () => onStart?.();
          audio.onended = () => {
            this.currentAudioElement = null;
            onEnd?.();
          };
          audio.onerror = () => {
            this.fallbackSpeechSynthesis(text, langCode, onStart, onEnd);
          };

          await audio.play();
          return;
        }
      }
    } catch {
      // Ignore network errors and proceed to SpeechSynthesis
    }

    // 2. Fallback to Browser SpeechSynthesis
    this.fallbackSpeechSynthesis(text, langCode, onStart, onEnd);
  }

  private fallbackSpeechSynthesis(
    text: string,
    langCode: string,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!('speechSynthesis' in window)) {
      onStart?.();
      setTimeout(() => onEnd?.(), 1500);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Pick best matching voice
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = langCode === 'ur' ? 'ur' : langCode === 'pa' ? 'pa' : 'en';
    const matchedVoice = voices.find(v => v.lang.startsWith(langPrefix)) || voices.find(v => v.lang.includes('IN') || v.lang.includes('PK'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop any current speech playback
   */
  stopPlayback(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceService = new VoiceService();
