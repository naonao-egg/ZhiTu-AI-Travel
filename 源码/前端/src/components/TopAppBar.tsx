import React from 'react';
import { Menu } from 'lucide-react';
import { useTravel } from '../context/TravelContext';

export default function TopAppBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { currentUser } = useTravel();

  return (
    <header className="bg-background-main flex justify-between items-center w-full px-safe-margin py-stack-md h-16 shrink-0 z-40 sticky top-0">
      <button aria-label="Menu" onClick={onMenuClick} className="text-primary hover:bg-surface-container transition-all active:scale-95 duration-200 rounded-full p-2 -ml-2 flex items-center justify-center">
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="font-display text-h1 font-bold text-primary tracking-tight">智途 SmartTrek</h1>
      <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden flex items-center justify-center shrink-0 border border-outline-variant/30 hover:scale-105 transition-transform duration-200 cursor-pointer">
        {currentUser?.avatarBase64 ? (
          <img 
            src={currentUser.avatarBase64} 
            alt={currentUser.username}
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>
    </header>
  );
}
