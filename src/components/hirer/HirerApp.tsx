import React, { useState, useEffect } from 'react';
import { JobBookingRequest, MatchedWorkerOption, ActiveJob } from '../../types';
import { api } from '../../services/api';
import { BottomTabBar, TabItem } from '../ui/BottomTabBar';
import { HirerBookWizard } from './HirerBookWizard';
import { HirerMatchingScreen } from './HirerMatchingScreen';
import { HirerActiveJobScreen } from './HirerActiveJobScreen';
import { HirerJobsTab } from './HirerJobsTab';
import { HirerProfileTab } from './HirerProfileTab';
import { PlusCircle, Briefcase, User } from 'lucide-react';

interface HirerAppProps {
  onLogout: () => void;
  onSwitchAccount: () => void;
}

export const HirerApp: React.FC<HirerAppProps> = ({ onLogout, onSwitchAccount }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'jobs' | 'profile'>('book');
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [pendingRequest, setPendingRequest] = useState<JobBookingRequest | null>(null);

  useEffect(() => {
    api.getActiveJob().then(job => {
      if (job) setActiveJob(job);
    });
  }, []);

  const handleBookingCompleted = (request: JobBookingRequest) => {
    setPendingRequest(request);
  };

  const handleHireWorker = async (option: MatchedWorkerOption) => {
    if (!pendingRequest) return;
    const job = await api.hireWorker(pendingRequest, option);
    setActiveJob(job);
    setPendingRequest(null);
  };

  const handleFinishJob = () => {
    setActiveJob(null);
    setActiveTab('jobs');
  };

  // If in active job tracking
  if (activeJob) {
    return <HirerActiveJobScreen job={activeJob} onJobFinished={handleFinishJob} />;
  }

  // If in matching stream
  if (pendingRequest) {
    return (
      <HirerMatchingScreen
        request={pendingRequest}
        onHireWorker={handleHireWorker}
        onCancel={() => setPendingRequest(null)}
      />
    );
  }

  const tabs: TabItem[] = [
    {
      id: 'book',
      label: 'Book',
      labelUr: 'بک کریں',
      icon: <PlusCircle className="w-6 h-6" />,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      labelUr: 'آرڈرز',
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      labelUr: 'پروفائل',
      icon: <User className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between sm:py-6 sm:px-4">
      <div className="w-full max-w-4xl mx-auto bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col min-h-[92dvh] relative">
        <main className="flex-1 flex flex-col">
          {activeTab === 'book' && (
            <HirerBookWizard
              onComplete={handleBookingCompleted}
              onCancel={() => setActiveTab('jobs')}
            />
          )}
          {activeTab === 'jobs' && <HirerJobsTab onRebook={() => setActiveTab('book')} />}
          {activeTab === 'profile' && (
            <HirerProfileTab
              onLogout={onLogout}
              onSwitchAccount={onSwitchAccount}
            />
          )}
        </main>

        {/* Fixed Bottom Tab Bar: MAX 3 TABS */}
        <BottomTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={tabId => setActiveTab(tabId as any)}
          isWorker={false}
        />
      </div>
    </div>
  );
};
