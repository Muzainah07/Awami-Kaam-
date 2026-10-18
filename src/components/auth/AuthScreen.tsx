import React, { useState, useEffect } from 'react';
import { UserRole, UserSession } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ShieldCheck, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import { isDemoMode } from '../../config/demo';

interface AuthScreenProps {
  role: UserRole;
  onSuccess: (session: UserSession) => void;
  onBack: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  role,
  onSuccess,
  onBack,
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const validateAndNormalizePhone = (raw: string): string | null => {
    const cleaned = raw.replace(/[^0-9]/g, '');
    let formatted = '';
    if (cleaned.startsWith('03') && cleaned.length === 11) {
      formatted = `+92${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('3') && cleaned.length === 10) {
      formatted = `+92${cleaned}`;
    } else {
      return null;
    }
    return formatted;
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const normalized = validateAndNormalizePhone(phoneNumber);
    if (!normalized) {
      setAuthError('Please enter a valid Pakistani mobile number (e.g. 03001234567)');
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      const res = await api.sendPhoneOtp(normalized);
      if (typeof res === 'object' && res.error) {
        setAuthError("This demo accepts demo numbers only. Tap 'Try demo as Worker/Hirer' or use guest login.");
        setLoading(false);
        return;
      }
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
    } catch (err: any) {
      setAuthError("This demo accepts demo numbers only. Tap 'Try demo as Worker/Hirer' or use guest login.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWithOtp = async (codeToVerify: string) => {
    const normalized = validateAndNormalizePhone(phoneNumber) || phoneNumber;
    setLoading(true);
    setAuthError(null);
    try {
      const session = await api.loginWithPhone(normalized, codeToVerify, role);
      onSuccess(session);
    } catch (err: any) {
      console.error('Verification error:', err);
      setAuthError(err?.message || "This demo accepts demo numbers only. Tap 'Try demo as Worker/Hirer' or use guest login.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setAuthError('Please enter the 6-digit OTP code');
      return;
    }
    handleVerifyWithOtp(otpCode);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpCode(val);
    if (val.length === 6) {
      handleVerifyWithOtp(val);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const session = await api.loginAsGuest(role);
      onSuccess(session);
    } catch (err: any) {
      console.error('Guest login error:', err);
      setAuthError(err?.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    try {
      const session = await api.loginAsDemoUser(role);
      onSuccess(session);
    } catch (err) {
      console.error('Demo login error:', err);
      setAuthError('Demo user not configured');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Top Header */}
      <div>
        <button
          onClick={step === 'otp' ? () => setStep('phone') : onBack}
          className="text-sm font-semibold text-[#6B7A72] hover:text-[#14201A] mb-6 inline-flex items-center gap-1 cursor-pointer"
        >
          ← واپس (Back)
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B6B3A]/10 text-[#0B6B3A] text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{role === 'worker' ? 'مزدور اکاؤنٹ (Worker)' : 'مالک اکاؤنٹ (Hirer)'}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#14201A] font-urdu leading-tight">
            {step === 'phone' ? 'اپنا موبائل نمبر درج کریں' : 'تصدیقی کوڈ درج کریں'}
          </h2>
          <p className="text-sm text-[#6B7A72] mt-1">
            {step === 'phone'
              ? 'Enter your Pakistani mobile number (03XX-XXXXXXX)'
              : 'Enter the 6-digit OTP code'}
          </p>
        </div>

        {/* Form Card */}
        <Card className="mb-4">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
                  موبائل نمبر (Mobile Number)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center gap-1 text-sm font-bold text-[#14201A] border-r border-[#E4E8E2] pr-2">
                    <span>🇵🇰</span>
                    <span>+92</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="03001234567"
                    className="w-full h-14 pl-22 pr-4 rounded-2xl border border-[#E4E8E2] text-lg font-bold text-[#14201A] focus:outline-hidden focus:border-[#0B6B3A] focus:ring-2 focus:ring-[#0B6B3A]/20"
                    autoFocus
                  />
                </div>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-[#D64545] p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <Button type="submit" loading={loading} size="lg">
                آگے بڑھیں (Send OTP)
              </Button>

              {/* Hackathon Quick Demo Button (Only when VITE_DEMO_MODE=true) */}
              {isDemoMode() && (
                <div className="pt-3 border-t border-[#E4E8E2] text-center">
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    className="w-full py-2.5 rounded-xl bg-[#0B6B3A]/10 text-[#0B6B3A] font-bold text-xs hover:bg-[#0B6B3A]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ One-Tap Demo Login ({role === 'worker' ? 'Worker' : 'Hirer'})</span>
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-[#D64545] p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
                  تصدیقی کوڈ (6-Digit OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={handleOtpChange}
                  placeholder="123456"
                  className="w-full h-16 text-center text-2xl sm:text-3xl font-black tracking-[0.3em] sm:tracking-[0.5em] rounded-2xl border border-[#E4E8E2] focus:outline-hidden focus:border-[#0B6B3A] focus:ring-2 focus:ring-[#0B6B3A]/20"
                  autoFocus
                />

                {isDemoMode() && (
                  <p className="text-center text-xs text-[#0B6B3A] font-bold mt-2">
                    Demo code: 123456
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setAuthError(null);
                    }}
                    className="text-[#6B7A72] hover:text-[#14201A] underline"
                  >
                    Change Number
                  </button>
                  <div className="ml-auto text-[#6B7A72]">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-[#0B6B3A] font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend Code
                      </button>
                    ) : (
                      <span>Resend in {countdown}s</span>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" loading={loading} size="lg">
                تصدیق کریں (Verify & Enter)
              </Button>
            </form>
          )}
        </Card>
      </div>

      {/* Guest Login Footer */}
      <div className="text-center py-4">
        <button
          type="button"
          onClick={handleGuestLogin}
          className="text-sm font-bold text-[#0B6B3A] hover:underline cursor-pointer"
        >
          مہمان کے طور پر جاری رکھیں (Continue as guest)
        </button>
      </div>
    </div>
  );
};
