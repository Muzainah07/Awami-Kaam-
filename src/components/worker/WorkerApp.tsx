import React, { useState, useEffect } from 'react';
import { WorkerProfile, ActiveJob } from '../../types';
import { api } from '../../services/api';
import { BottomTabBar, TabItem } from '../ui/BottomTabBar';
import { WorkerHomeTab } from './WorkerHomeTab';
import { WorkerEarningsTab } from './WorkerEarningsTab';
import { WorkerProfileTab } from './WorkerProfileTab';
import { WorkerActiveJob } from './WorkerActiveJob';
import { WorkerOnboarding } from './WorkerOnboarding';
import { VoiceAssistantButton } from './VoiceAssistantButton';
import { Briefcase, Wallet, User } from 'lucide-react';

interface WorkerAppProps {
  onLogout: () => void;
  onSwitchAccount: () => void;
}

export const WorkerApp: React.FC<WorkerAppProps> = ({ onLogout, onSwitchAccount }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'earnings' | 'profile'>('home');
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [activeJob, setActiveJob] = useState<ActiveJob | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    loadWorkerData();
  }, []);

  const loadWorkerData = async () => {
    const profile = await api.getWorkerProfile();
    setWorker(profile);

    // Check if active job exists
    const currentActiveJob = await api.getActiveJob();
    setActiveJob(currentActiveJob);
  };

  const handleAcceptOffer = async (offerId: string) => {
    const job = await api.acceptJobOffer(offerId);
    setActiveJob(job);
  };

  const handleFinishJob = () => {
    setActiveJob(null);
    setActiveTab('earnings');
  };

  const handleVoiceIntent = (intent: string, value?: number) => {
    if (intent === 'set_online') {
      api.updateWorkerAvailability(true, worker?.latitude || 24.86, worker?.longitude || 67.0);
    } else if (intent === 'set_offline') {
      api.updateWorkerAvailability(false, worker?.latitude || 24.86, worker?.longitude || 67.0);
    } else if (intent === 'change_rate' && value) {
      // update rate
    }
  };

  if (!worker) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#0B6B3A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <WorkerOnboarding
        onComplete={newProfile => {
          setWorker(newProfile);
          setIsOnboarding(false);
        }}
      />
    );
  }

  // Active Job Takeover
  if (activeJob) {
    return <WorkerActiveJob job={activeJob} onFinishJob={handleFinishJob} />;
  }

  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Home',
      labelUr: 'کام',
      icon: <Briefcase className="w-7 h-7" />,
    },
    {
      id: 'earnings',
      label: 'Earnings',
      labelUr: 'کمائی',
      icon: <Wallet className="w-7 h-7" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      labelUr: 'پروفائل',
      icon: <User className="w-7 h-7" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between relative sm:py-6 sm:px-4">
      <div className="w-full max-w-4xl mx-auto bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col min-h-[92dvh] relative">
        {/* Scrollable View Container */}
        <main className="flex-1 flex flex-col">
          {activeTab === 'home' && (
            <WorkerHomeTab
              worker={worker}
              onAcceptOffer={handleAcceptOffer}
            />
          )}
          {activeTab === 'earnings' && <WorkerEarningsTab />}
          {activeTab === 'profile' && (
            <WorkerProfileTab
              worker={worker}
              onLogout={onLogout}
              onSwitchAccount={onSwitchAccount}
            />
          )}
        </main>

        {/* Persistent Voice Assistant Mic Button */}
        <VoiceAssistantButton onStateChangeRequested={handleVoiceIntent} />

        {/* Fixed Bottom Tab Bar: MAX 3 TABS */}
        <BottomTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={tabId => setActiveTab(tabId as any)}
          isWorker={true}
        />
      </div>
    </div>
  );
};
