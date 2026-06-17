import React from 'react';
import { Compass, Calendar, User, Settings, LogOut, CheckCircle, Sparkles } from 'lucide-react';
import { useTravel } from '../context/TravelContext';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tabIndex: number) => void;
}

export default function NavigationDrawer({ isOpen, onClose, setActiveTab }: NavigationDrawerProps) {
  const { currentUser, setCurrentUser, resetTrip } = useTravel();

  const handleLogout = () => {
    setCurrentUser(null);
    onClose();
  };

  const handleNewTrip = () => {
    resetTrip();
    setActiveTab(0);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-on-background/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-[280px] bg-surface z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-safe-margin py-stack-lg border-b border-surface-variant flex flex-col gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-container overflow-hidden border-2 border-primary-container shadow-sm">
            {currentUser?.avatarBase64 ? (
              <img 
                src={currentUser.avatarBase64} 
                alt={currentUser.username}
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="font-display text-h2 font-bold text-on-surface">
              {currentUser?.username || '游客用户'}
            </h2>
            <p className="font-body-md text-text-muted text-sm flex items-center gap-1.5 mt-0.5">
               <CheckCircle className="text-primary w-3.5 h-3.5" />
               高级旅行探险家
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {/* New Trip Button - Highlighted */}
          <button 
            onClick={handleNewTrip}
            className="flex items-center gap-3 px-4 py-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-[0.98] text-left mb-2 group"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-body-md font-bold">开始新旅途</span>
          </button>

          <button 
            onClick={() => { setActiveTab(0); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-surface-container-high transition-colors active:scale-[0.98] text-on-surface text-left"
          >
            <Compass className="w-5 h-5 text-on-surface-variant" />
            <span className="font-body-md font-semibold">探索</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab(1); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-surface-container-high transition-colors active:scale-[0.98] text-on-surface text-left"
          >
            <Calendar className="w-5 h-5 text-on-surface-variant" />
            <span className="font-body-md font-semibold">今日行程</span>
          </button>

          <button 
            onClick={() => { setActiveTab(2); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-surface-container-high transition-colors active:scale-[0.98] text-on-surface text-left"
          >
            <User className="w-5 h-5 text-on-surface-variant" />
            <span className="font-body-md font-semibold">我的护照</span>
          </button>
          
          <hr className="my-2 border-surface-variant mx-4" />

          <button className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-surface-container-high transition-colors active:scale-[0.98] text-on-surface text-left">
            <Settings className="w-5 h-5 text-on-surface-variant" />
            <span className="font-body-md font-semibold">设置</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-error-container hover:text-on-error-container transition-colors active:scale-[0.98] text-error mt-auto mb-4 border border-transparent hover:border-error/20 text-left"
          >
             <LogOut className="w-5 h-5" />
             <span className="font-body-md font-semibold">退出登录</span>
          </button>
        </nav>
      </div>
    </>
  );
}
