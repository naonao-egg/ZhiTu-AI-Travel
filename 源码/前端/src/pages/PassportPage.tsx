import React, { useRef, useState, useEffect } from 'react';
import { useTravel } from '../context/TravelContext';
import { Brain, Verified, Map as MapIcon, Calendar, Camera, Loader2, Trash2 } from 'lucide-react';

interface PassportPageProps {
  setActiveTab: (tab: number) => void;
}

export default function PassportPage({ setActiveTab }: PassportPageProps) {
  const { globalItinerary, currentUser, setCurrentUser, setGlobalItinerary } = useTravel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [history, setHistory] = React.useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);

  // Fetch history records
  React.useEffect(() => {
    if (currentUser?.username) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const response = await fetch(`http://localhost:8080/api/history?username=${currentUser.username}`);
          if (response.ok) {
            const data = await response.json();
            setHistory(data);
          }
        } catch (error) {
          console.error('Failed to fetch history:', error);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [currentUser?.username]);

  // Dynamic tag extraction logic
  const defaultPreferences = [
    { icon: '🌶️', label: '嗜辣星人', colorClass: 'bg-error-container text-on-error-container' },
    { icon: '🖼️', label: '博物馆爱好者', colorClass: 'bg-tertiary-container text-on-tertiary-container' },
    { icon: '🚶‍♂️', label: '慢节奏', colorClass: 'bg-primary-container text-on-primary-container' },
    { icon: '📸', label: '街拍达人', colorClass: 'bg-secondary-container text-on-secondary-container' },
  ];

  // Extract real tags from global itinerary
  const extractedTags = globalItinerary.flatMap(card => {
    if (!card.tags) return [];
    return card.tags.split(/[，,·|•]/).map(t => t.trim()).filter(t => t.length > 0);
  });

  const uniqueTags = Array.from(new Set(extractedTags));

  const dynamicPreferences = uniqueTags.length > 0 
    ? uniqueTags.map((tag, idx) => {
        const colors = [
          'bg-primary-container text-on-primary-container',
          'bg-secondary-container text-on-secondary-container',
          'bg-tertiary-container text-on-tertiary-container',
          'bg-error-container text-on-error-container',
          'bg-surface-container-high text-on-surface'
        ];
        const icons = ['✨', '📍', '🍱', '🎒', '🌟', '🔍'];
        return {
          icon: icons[idx % icons.length],
          label: tag,
          colorClass: colors[idx % colors.length]
        };
      })
    : defaultPreferences;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('http://localhost:8080/api/auth/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, avatarBase64: base64String }),
        });

        if (response.ok) {
          setCurrentUser({ ...currentUser, avatarBase64: base64String });
        }
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreHistory = (item: any) => {
    try {
      const parsedData = JSON.parse(item.itineraryJson);
      // 兼容处理：如果解析出来是数组就直接用，如果是个对象就取它的 cards 字段
      const cardsArray = Array.isArray(parsedData) ? parsedData : (parsedData.cards || []);
      
      // 深度数据清洗：确保每个项目都有 ID 和正确的图片字段映射
      const normalizedCards = cardsArray.map((card: any, idx: number) => ({
        ...card,
        id: card.id || `history-${item.tripId}-${idx}`,
        imageUrl: card.imageUrl || card.image || '', // 适配后端不同时期的字段名
      }));

      setGlobalItinerary(normalizedCards);
      setActiveTab(1); // 跳转到行程单页
    } catch (e) {
      console.error('Failed to parse history itinerary', e);
    }
  };

  const handleDeleteHistory = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这段旅行记忆吗？')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/history/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete history:', error);
    }
  };

  // Get initials for default avatar
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto px-safe-margin pt-stack-sm pb-[140px] flex flex-col gap-stack-lg bg-background-main h-full">
      {/* Passport Identity Card */}
      <section className="flex-shrink-0 bg-surface-card rounded-3xl shadow-lg p-8 flex flex-col items-center relative overflow-hidden border border-surface-variant/20">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-container/10 rounded-full blur-3xl"></div>
        
        {/* Avatar Area - Fixed Aspect Ratio */}
        <div 
          className="relative flex-none z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95 mb-4 flex items-center justify-center"
          onClick={handleAvatarClick}
          style={{ width: '96px', height: '96px', minWidth: '96px', minHeight: '96px' }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-primary/5 bg-surface-container-low shadow-inner"></div>
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-xl relative z-10 flex items-center justify-center bg-white">
            {currentUser?.avatarBase64 ? (
              <img className="w-full h-full object-cover" src={currentUser.avatarBase64} alt={currentUser.username} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-black text-2xl">
                {getInitials(currentUser?.username || 'Guest')}
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="text-white w-6 h-6 animate-spin" />
              ) : (
                <Camera className="text-white w-6 h-6" />
              )}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>

        <div className="flex flex-col items-center gap-1.5 z-20 mb-8">
          <h2 className="font-display text-2xl font-black text-on-surface tracking-tight">
            {currentUser?.username || '游客用户'}
          </h2>
          <div className="font-body-md text-text-muted flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            <Verified className="text-primary w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-tight text-primary">高级旅行探险家</span>
          </div>
        </div>
        
        <div className="flex w-full justify-around pt-6 border-t border-surface-variant/30 z-10">
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-2xl font-black text-primary leading-none">{globalItinerary.length}</span>
            <span className="font-bold text-[9px] text-text-muted uppercase tracking-widest">已规划行程</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-2xl font-black text-primary leading-none">3</span>
            <span className="font-bold text-[9px] text-text-muted uppercase tracking-widest">解锁大洲</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-2xl font-black text-primary leading-none">87</span>
            <span className="font-bold text-[9px] text-text-muted uppercase tracking-widest">旅行天数</span>
          </div>
        </div>
      </section>

      {/* 我的旅行记忆 (History) */}
      <section className="flex flex-col gap-stack-sm w-full">
        <div className="flex items-center gap-2 mb-2">
          <MapIcon className="text-primary w-5 h-5" />
          <h3 className="font-h2 text-h2 text-on-surface font-black">🧳 我的旅行记忆</h3>
        </div>
        
        <div className="flex flex-col gap-3">
          {isLoadingHistory ? (
             <div className="flex justify-center py-8">
               <Loader2 className="w-6 h-6 text-primary animate-spin" />
             </div>
          ) : history.length > 0 ? (
            history.map((item) => {
              return (
                <div 
                  key={item.tripId} 
                  onClick={() => handleRestoreHistory(item)}
                  className="bg-surface-card p-4 rounded-xl border border-surface-variant/30 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer flex flex-col gap-2 group relative overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-text-muted flex items-center gap-1.5">
                       <Calendar className="w-3 h-3" />
                       {new Date(item.createdAt || item.createTime).toLocaleString()}
                     </span>
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={(e) => handleDeleteHistory(e, item.id)}
                         className="text-text-muted hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors z-10"
                         title="删除记录"
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                       <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">回顾</span>
                     </div>
                  </div>
                  <h4 className="font-bold text-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors leading-relaxed">
                     {item.userMessage || '开启了一段神秘旅程'}
                  </h4>
                </div>
              );
            })
          ) : (
            <p className="text-center text-text-muted text-xs py-8 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/30">
               还没有保存过行程哦，快去探索吧！✨
            </p>
          )}
        </div>
      </section>

      {/* AI 懂你 (AI Memory Visualized) */}
      <section className="flex-shrink-0 flex flex-col gap-stack-sm w-full mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="text-primary w-5 h-5" />
          <h3 className="font-h2 text-h2 text-on-surface font-black">AI 懂你</h3>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {dynamicPreferences.map((pref, idx) => (
            <div 
              key={`${pref.label}-${idx}`} 
              className={`${pref.colorClass} px-4 py-2 rounded-full font-bold text-xs shadow-sm border border-black/5 flex items-center gap-2 transition-all hover:scale-105 hover:shadow-md cursor-default animate-fade-in`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <span className="text-base">{pref.icon}</span> {pref.label}
            </div>
          ))}
        </div>
        <p className="font-body-md text-text-muted text-[11px] mt-3 ml-1 leading-relaxed">
          {uniqueTags.length > 0 
            ? "已根据您的近期探索偏好，自动提取并更新了您的旅行基因。✨"
            : "根据你的聊天与行程自动生成的旅行基因片段。"}
        </p>
      </section>
    </div>
  );
}
