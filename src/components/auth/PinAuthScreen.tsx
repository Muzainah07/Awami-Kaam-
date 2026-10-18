import React, { useState } from 'react';
import { UserRole, UserSession } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface PinAuthScreenProps {
  role: UserRole;
  onSuccess: (session: UserSession) => void;
  onBack: () => void;
}

export const PinAuthScreen: React.FC<PinAuthScreenProps> = ({
  role,
  onSuccess,
  onBack,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanedPhone.length !== 10 && cleanedPhone.length !== 11) {
      setAuthError('Please enter a valid 10-11 digit Pakistani mobile number.');
      return;
    }
    if (pin.length !== 6) {
      setAuthError('PIN must be 6 digits.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const session = await api.signInWithPhonePin(role, phoneNumber, pin);
        onSuccess(session);
      } else {
        if (!name.trim()) {
            setAuthError('Name is required for new accounts.');
            setLoading(false);
            return;
        }
        const session = await api.signUpWithPhonePin(role, name, phoneNumber, pin);
        onSuccess(session);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between p-5 max-w-md mx-auto">
      <div>
        <button
          onClick={onBack}
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
            {isLogin ? 'Log in' : 'Create Account'}
          </h2>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <div>
                    <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-14 px-4 rounded-2xl border border-[#E4E8E2] text-lg font-bold" required />
                </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">Mobile Number (+92)</label>
              <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="03001234567" className="w-full h-14 px-4 rounded-2xl border border-[#E4E8E2] text-lg font-bold" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">6-Digit PIN</label>
              <div className="relative flex items-center">
                <input type={showPin ? "text" : "password"} maxLength={6} value={pin} onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ''))} placeholder="123456" className="w-full h-14 px-4 rounded-2xl border border-[#E4E8E2] text-lg font-bold tracking-widest" required />
                <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-4 text-[#6B7A72]">
                    {showPin ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-[#D64545] p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <Button type="submit" loading={loading} size="lg">
              {isLogin ? 'Log In' : 'Create Account'}
            </Button>
            
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-sm font-bold text-[#0B6B3A] underline">
                {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};
