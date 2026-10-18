import React, { useEffect, useState } from 'react';
import { JobListing } from '../../types';
import { api, SKILL_DEFINITIONS } from '../../services/api';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { Briefcase, MapPin, Plus } from 'lucide-react';

interface HirerJobsTabProps {
  onRebook: () => void;
}

export const HirerJobsTab: React.FC<HirerJobsTabProps> = ({ onRebook }) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHirerJobs()
      .then(data => setJobs(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-5 pb-24 max-w-md mx-auto w-full space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <Skeleton className="h-28 rounded-[20px]" />
        <Skeleton className="h-28 rounded-[20px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 pb-24 max-w-md mx-auto w-full space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-2xl font-black text-[#14201A] font-urdu leading-tight">
            آپ کے آرڈرز (My Jobs)
          </h2>
          <p className="text-xs text-[#6B7A72]">Recent requests and history</p>
        </div>

        <button
          onClick={onRebook}
          className="h-10 px-3 rounded-xl bg-[#0B6B3A]/10 text-[#0B6B3A] text-xs font-bold hover:bg-[#0B6B3A]/20 active:scale-95 transition-all flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>نیا کام</span>
        </button>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="No jobs requested yet"
          titleUr="ابھی کوئی آرڈر نہیں دیا گیا"
          description="Post your first request to find nearby painters, plumbers, electricians, or laborers."
          action={
            <Button size="lg" onClick={onRebook}>
              پہلا کاریگر بُک کریں (Book First Worker)
            </Button>
          }
        />
      ) : (
        /* Max 5 items per strict anti-clutter rule */
        <div className="space-y-3">
          {jobs.slice(0, 5).map(job => {
            const def = SKILL_DEFINITIONS[job.skill_needed] || SKILL_DEFINITIONS.painter;
            const isCompleted = job.status === 'completed';

            return (
              <Card key={job.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B6B3A]/10 text-2xl flex items-center justify-center shrink-0">
                      {def.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#14201A] leading-tight font-urdu">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7A72] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#D64545]" />
                        <span>{job.area}</span>
                        <span>•</span>
                        <span>{job.created_at}</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant={isCompleted ? 'success' : 'fair'}>
                    {isCompleted ? 'مکمل (Done)' : 'جاری (Open)'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E4E8E2] text-xs">
                  <span className="text-[#6B7A72]">Budget / Wage:</span>
                  <span className="font-black text-base text-[#0B6B3A]">
                    ₨ {job.offered_rate_pkr.toLocaleString()}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
