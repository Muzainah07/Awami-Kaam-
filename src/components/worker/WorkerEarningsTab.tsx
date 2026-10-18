import React, { useEffect, useState } from 'react';
import { WorkerEarnings } from '../../types';
import { api, SKILL_DEFINITIONS } from '../../services/api';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Star, Wallet, CheckCircle2 } from 'lucide-react';

export const WorkerEarningsTab: React.FC = () => {
  const [earnings, setEarnings] = useState<WorkerEarnings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getWorkerEarnings()
      .then(data => setEarnings(data))
      .finally(() => setLoading(false));
  }, []);

  // 1. Loading State with Skeletons
  if (loading) {
    return (
      <div className="flex-1 p-5 pb-24 max-w-md mx-auto w-full space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-[20px]" />
          <Skeleton className="h-28 rounded-[20px]" />
        </div>
        <Skeleton className="h-6 w-48 mt-4" />
        <Skeleton className="h-20 rounded-[20px]" />
        <Skeleton className="h-20 rounded-[20px]" />
        <Skeleton className="h-20 rounded-[20px]" />
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="flex-1 p-5 pb-24 max-w-md mx-auto w-full flex items-center justify-center">
        <EmptyState
          icon={<Wallet className="w-8 h-8" />}
          title="No earnings data"
          titleUr="کمائی کا ریکارڈ موجود نہیں"
          description="Complete your first daily-wage job to start tracking cash earnings."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 pb-24 max-w-md mx-auto w-full space-y-5 animate-in fade-in">
      {/* Header with Star Rating Trust Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
            آپ کی کمائی (Earnings)
          </h2>
          <p className="text-xs text-[#6B7A72]">Direct daily cash earnings</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2B705]/15 border border-[#F2B705]/40 text-[#14201A] font-bold text-xs shrink-0">
          <Star className="w-4 h-4 fill-[#F2B705] text-[#F2B705]" />
          <span>4.9 Trust Rating</span>
        </div>
      </div>

      {/* Two Big Number Metric Cards (Today & This Week) */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-white border-[#E4E8E2]">
          <span className="text-xs font-bold text-[#6B7A72] font-urdu block">
            آج کی کمائی (Today)
          </span>
          {/* Largest Element in Card */}
          <span className="text-3xl font-black text-[#0B6B3A] mt-1 block tracking-tight">
            ₨ {earnings.todayPkr.toLocaleString()}
          </span>
          <span className="text-[11px] font-semibold text-[#1F9D55] mt-1 block">
            ✓ وصول ہو چکی
          </span>
        </Card>

        <Card className="p-4 bg-white border-[#E4E8E2]">
          <span className="text-xs font-bold text-[#6B7A72] font-urdu block">
            اس ہفتے (This Week)
          </span>
          {/* Largest Element in Card */}
          <span className="text-3xl font-black text-[#14201A] mt-1 block tracking-tight">
            ₨ {earnings.thisWeekPkr.toLocaleString()}
          </span>
          <span className="text-[11px] font-semibold text-[#6B7A72] mt-1 block">
            {earnings.jobsCompleted} کام مکمل
          </span>
        </Card>
      </div>

      {/* Completed Jobs List (Strict Anti-Clutter Rule: Max 5 items) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-[#14201A] font-urdu">
            حالیہ مکمل شدہ کام (Completed Jobs)
          </h3>
          <span className="text-xs text-[#6B7A72] font-medium">Last 5 jobs</span>
        </div>

        {earnings.completedList.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-8 h-8" />}
            title="No completed jobs yet"
            titleUr="ابھی کوئی کام مکمل نہیں ہوا"
            description="When you complete a job, your earnings and reviews will appear here."
          />
        ) : (
          <div className="space-y-2.5">
            {earnings.completedList.slice(0, 5).map(item => {
              const def = SKILL_DEFINITIONS[item.skill] || SKILL_DEFINITIONS.painter;
              return (
                <Card key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B6B3A]/10 text-xl flex items-center justify-center shrink-0">
                      {def.icon}
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-[#14201A] leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-xs text-[#6B7A72]">
                        {item.area} • {item.date}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-[#0B6B3A] block">
                      +₨ {item.earningsPkr.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-0.5 justify-end text-xs font-bold text-[#F2B705]">
                      <Star className="w-3.5 h-3.5 fill-[#F2B705]" />
                      <span>{item.ratingStars}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
