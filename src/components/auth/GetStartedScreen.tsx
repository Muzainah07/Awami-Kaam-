import React, { useState } from 'react';
import { UserRole, UserSession } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { isDemoMode } from '../../config/demo';

interface GetStartedScreenProps {
  role: UserRole;
  onSuccess: (session: UserSession) => void;
  onBack: () => void;
}

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({
  role,
  onSuccess,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setAuthError('Please enter your name');
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      // In Demo mode, we bypass actual OTP and use anonymous login
      // Then upsert profile with the provided name and phone
      // The API implementation for anonymous auth + upsert logic needs to handle this.
      // Based on instructions, we need a new login flow.
      // I will assume api.loginAnonymouslyWithProfile exists or create it in api.ts
      const session = await api.loginAnonymouslyWithProfile(role, name, phoneNumber);
      onSuccess(session);
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError('Something went wrong, please try again.');
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
            Get started
          </h2>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full h-14 px-4 rounded-2xl border border-[#E4E8E2] text-lg font-bold text-[#14201A] focus:outline-hidden focus:border-[#0B6B3A] focus:ring-2 focus:ring-[#0B6B3A]/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
                Mobile Number (Optional)
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
              Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
