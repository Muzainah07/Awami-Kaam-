import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import {
  MapPin,
  CreditCard,
  HelpCircle,
  LogOut,
  ArrowLeftRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface HirerProfileTabProps {
  onLogout: () => void;
  onSwitchAccount: () => void;
}

export const HirerProfileTab: React.FC<HirerProfileTabProps> = ({
  onLogout,
  onSwitchAccount,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'easypaisa' | 'jazzcash'>('cash');

  return (
    <div className="flex-1 p-5 pb-24 max-w-md mx-auto w-full space-y-4 animate-in fade-in">
      {/* 1. Hirer Identity Card */}
      <Card className="text-center p-6 bg-white">
        <div className="mx-auto mb-3 flex justify-center">
          <Avatar name="Dr. Bilal Qureshi" size="xl" bgColor="#0B6B3A" />
        </div>
        <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
          ڈاکٹر بلال قریشی
        </h2>
        <p className="text-xs font-semibold text-[#6B7A72] mt-0.5">
          Dr. Bilal Qureshi • 0333-2211948
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F9D55]/10 text-[#0B6B3A] text-xs font-bold mt-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Homeowner</span>
        </div>
      </Card>

      {/* 2. Saved Locations */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#6B7A72] uppercase tracking-wider">
            محفوظ مقامات (Saved Locations)
          </span>
          <button className="text-xs font-bold text-[#0B6B3A] hover:underline">+ شامل کریں</button>
        </div>

        <div className="space-y-2">
          <div className="p-3.5 bg-gray-50 rounded-2xl flex items-center justify-between min-h-[56px]">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#0B6B3A] shrink-0" />
              <div>
                <span className="font-bold text-xs text-[#14201A] block">Home (گھر)</span>
                <span className="text-[11px] text-[#6B7A72]">Block 13-D, Gulshan-e-Iqbal</span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#0B6B3A] shrink-0">Default</span>
          </div>
        </div>
      </Card>

      {/* 3. Payment Preference (Touch target 56px: h-14) */}
      <Card className="space-y-3">
        <span className="text-xs font-bold text-[#6B7A72] uppercase tracking-wider block">
          ادائیگی کا طریقہ (Payment Method)
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`h-14 rounded-2xl border text-xs font-bold transition-all text-center select-none ${
              paymentMethod === 'cash'
                ? 'bg-[#0B6B3A] text-white border-[#0B6B3A] shadow-xs'
                : 'bg-white text-[#14201A] border-[#E4E8E2] hover:bg-gray-50'
            }`}
          >
            💵 نقد (Cash)
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('easypaisa')}
            className={`h-14 rounded-2xl border text-xs font-bold transition-all text-center select-none ${
              paymentMethod === 'easypaisa'
                ? 'bg-[#0B6B3A] text-white border-[#0B6B3A] shadow-xs'
                : 'bg-white text-[#14201A] border-[#E4E8E2] hover:bg-gray-50'
            }`}
          >
            Easypaisa
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('jazzcash')}
            className={`h-14 rounded-2xl border text-xs font-bold transition-all text-center select-none ${
              paymentMethod === 'jazzcash'
                ? 'bg-[#0B6B3A] text-white border-[#0B6B3A] shadow-xs'
                : 'bg-white text-[#14201A] border-[#E4E8E2] hover:bg-gray-50'
            }`}
          >
            JazzCash
          </button>
        </div>
      </Card>

      {/* 4. Help & Support Link (h-14, 56px touch target) */}
      <Card
        className="flex items-center justify-between p-4 min-h-[56px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-[#6B7A72] shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#14201A] font-urdu leading-tight">
              مدد اور ہیلپ لائن (Support)
            </h4>
            <p className="text-xs text-[#6B7A72]">24/7 dedicated customer care</p>
          </div>
        </div>
        <span className="text-sm font-bold text-[#0B6B3A] shrink-0">021-111</span>
      </Card>

      {/* 5. Account Actions: Switch Account, Sign Out, Delete Account */}
      <div className="space-y-3 pt-2">
        {/* Phone Verification Status (Demo Note) */}
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-amber-800 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Phone not verified (demo)</p>
            <p className="text-amber-700">Verification via local Pakistani gateway is coming soon.</p>
          </div>
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
