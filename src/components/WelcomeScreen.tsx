import React, { useState } from 'react';
import { UserRole, UserSession } from '../types';
import { api } from '../services/api';
import { Card } from './ui/Card';
import { Mic, Briefcase, Sparkles, Zap } from 'lucide-react';
import { isDemoMode } from '../config/demo';

interface WelcomeScreenProps {
  onSelectRole: (role: UserRole) => void;
  onSuccess: (session: UserSession) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectRole, onSuccess }) => {
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleQuickDemoLogin = async (role: UserRole) => {
    setLoadingRole(role);
    try {
      const session = await api.loginAsDemoUser(role);
      onSuccess(session);
    } catch (err) {
      console.error('Demo login error:', err);
      // Fallback to regular role select
      onSelectRole(role);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between p-5 max-w-md mx-auto">
      {/* Top Branding */}
      <div className="pt-8 text-center">
        {/* Brand Logo */}
        <div className="w-20 h-20 rounded-[28px] bg-[#0B6B3A] text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#0B6B3A]/25 relative">
          <span className="text-3xl">🌙</span>
          <span className="absolute bottom-2 right-2 text-xs text-[#F2B705]">★</span>
        </div>

        <h1 className="text-4xl font-extrabold text-[#14201A] font-urdu leading-tight">
          عوامی کام
        </h1>
        <p className="text-lg font-black text-[#0B6B3A] tracking-tight mt-0.5">
          Awami Kam
        </p>

        <p className="text-sm text-[#6B7A72] font-urdu mt-3 leading-relaxed max-w-xs mx-auto">
          پاکستان کا پہلا آواز سے چلنے والا یومیہ مزدوری کا پلیٹ فارم۔ چوک کی لمبی قطاروں سے نجات۔
        </p>
        <p className="text-xs text-[#6B7A72] mt-1">
          Pakistan's AI voice-first daily-wage marketplace
        </p>
      </div>

      {/* Middle Value Props Card */}
      <div className="my-6">
        <Card className="bg-white/80 border-[#E4E8E2] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B6B3A]/10 text-[#0B6B3A] flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#14201A] font-urdu">پڑھنے لکھنے کی ضرورت نہیں</div>
              <div className="text-[11px] text-[#6B7A72]">100% voice-first in regional languages</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#E4E8E2]">
            <div className="w-10 h-10 rounded-2xl bg-[#F2B705]/15 text-[#946800] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#14201A] font-urdu">منصفانہ اجرت کی ضمانت</div>
              <div className="text-[11px] text-[#6B7A72]">AI Fair Wage Engine protects workers</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Action Buttons (Thumb Zone) */}
      <div className="space-y-3 pb-6">
        <button
          onClick={() => onSelectRole('worker')}
          className="w-full h-20 rounded-[20px] bg-[#0B6B3A] text-white hover:bg-[#084D2A] active:scale-[0.98] transition-all duration-200 p-4 flex items-center justify-between shadow-lg shadow-[#0B6B3A]/20 cursor-pointer"
        >
          <div className="text-left">
            <span className="font-urdu text-xl font-bold block leading-tight">
              میں مزدور ہوں (Worker)
            </span>
            <span className="text-xs text-white/80">
              کام تلاش کریں، آواز سے پروفائل بنائیں
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <Mic className="w-6 h-6 text-white" />
          </div>
        </button>

        <button
          onClick={() => onSelectRole('hirer')}
          className="w-full h-20 rounded-[20px] bg-white border-2 border-[#E4E8E2] text-[#14201A] hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 p-4 flex items-center justify-between shadow-xs cursor-pointer"
        >
          <div className="text-left">
            <span className="font-urdu text-xl font-bold block leading-tight text-[#14201A]">
              مجھے کاریگر چاہیے (Hirer)
            </span>
            <span className="text-xs text-[#6B7A72]">
              پینٹر، پلمبر، الیکٹریشن چند منٹوں میں
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6 text-[#14201A]" />
          </div>
        </button>

        {/* Hackathon One-Tap Demo Access Buttons */}
        {isDemoMode() && (
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('worker')}
              disabled={loadingRole !== null}
              className="py-2.5 px-3 rounded-xl bg-[#0B6B3A]/10 border border-[#0B6B3A]/30 text-[#0B6B3A] hover:bg-[#0B6B3A]/20 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-[#0B6B3A]" />
              <span>{loadingRole === 'worker' ? 'Signing in...' : '⚡ Try Demo Worker'}</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('hirer')}
              disabled={loadingRole !== null}
              className="py-2.5 px-3 rounded-xl bg-[#F2B705]/15 border border-[#F2B705]/40 text-[#946800] hover:bg-[#F2B705]/25 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-[#946800]" />
              <span>{loadingRole === 'hirer' ? 'Signing in...' : '⚡ Try Demo Hirer'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
