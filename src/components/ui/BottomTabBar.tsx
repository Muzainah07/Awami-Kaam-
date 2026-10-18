import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  labelUr?: string;
  icon: React.ReactNode;
  badge?: number | string;
}

interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  isWorker?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  isWorker = false,
}) => {
  // Anti-clutter enforcement: Max 3 tabs
  const visibleTabs = tabs.slice(0, 3);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E4E8E2] shadow-[0_-4px_16px_rgba(20,32,26,0.04)]">
      <nav className="max-w-md mx-auto px-4 py-2 flex items-center justify-around h-20">
      {visibleTabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center h-full min-h-[56px] rounded-2xl transition-all duration-200 relative ${
              isActive
                ? 'text-[#0B6B3A] font-bold'
                : 'text-[#6B7A72] hover:text-[#14201A] font-medium'
            }`}
          >
            {/* Active Indicator bar */}
            {isActive && (
              <span className="absolute top-0 w-8 h-1 bg-[#0B6B3A] rounded-full" />
            )}

            <div className={`relative ${isWorker ? 'scale-110 mb-1' : 'mb-0.5'}`}>
              {tab.icon}
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#D64545] text-white text-[10px] font-black flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center leading-none">
              {tab.labelUr && (
                <span className={`font-urdu leading-tight ${isWorker ? 'text-base font-bold' : 'text-xs'}`}>
                  {tab.labelUr}
                </span>
              )}
              <span className={`${isWorker ? 'text-[11px]' : 'text-xs'}`}>
                {tab.label}
              </span>
            </div>
          </button>
        );
      })}
      </nav>
    </div>
  );
};
