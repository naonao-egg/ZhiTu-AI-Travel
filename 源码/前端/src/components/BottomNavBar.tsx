import React from 'react';
import { Compass, Calendar, User } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: number;
  setActiveTab: (tabIndex: number) => void;
}

export default function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  const tabs = [
    { label: '探索', icon: Compass },
    { label: '行程', icon: Calendar },
    { label: '护照', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-safe-margin pb-stack-lg pt-stack-sm bg-surface/80 backdrop-blur-xl shadow-lg rounded-t-xl border-t border-surface-variant/20">
      {tabs.map((tab, index) => {
        const isActive = activeTab === index;
        const Icon = tab.icon;
        return (
          <button
            key={tab.label}
            onClick={() => setActiveTab(index)}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 duration-300 ${
              isActive 
                ? 'bg-primary-container text-on-primary-container rounded-full px-6 py-2 shadow-[0_4px_12px_rgb(16,185,129,0.15)]' 
                : 'text-on-surface-variant p-2 hover:bg-surface-container rounded-lg'
            }`}
          >
            <Icon 
              className={`w-5 h-5 ${isActive ? 'mb-0' : 'mb-0.5'}`} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className={`font-body-md text-[11px] font-bold tracking-wider ${isActive ? 'mt-0.5' : 'mt-1'}`}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
