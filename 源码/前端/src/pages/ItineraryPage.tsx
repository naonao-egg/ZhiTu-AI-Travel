import React, { useRef, useState } from 'react';
import { useTravel } from '../context/TravelContext';
import { MapPin, Clock, Car, Info, Sparkles, Compass, Calendar, Download, Loader2 } from 'lucide-react';
import { FallbackImage } from '../components/FallbackImage';
import { toPng } from 'html-to-image';

export default function ItineraryPage() {
  const { globalItinerary } = useTravel();
  const itineraryRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Helper to generate a virtual time string based on index
  const getVirtualTime = (index: number) => {
    const startHour = 9;
    const currentHour = startHour + Math.floor(index * 2);
    const minutes = (index % 2) === 0 ? "00" : "30";
    return `${currentHour.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleExportPoster = async () => {
    if (!itineraryRef.current) return;
    setIsExporting(true);
    
    try {
      const element = itineraryRef.current;
      
      // 核心修复：显式指定高度为 scrollHeight，确保捕获完整长图
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2, 
        backgroundColor: '#FAFAFA',
        height: element.scrollHeight,
        width: element.scrollWidth,
        style: {
          // 确保在渲染时元素是展开的
          overflow: 'visible',
        }
      });
      
      const link = document.createElement('a');
      link.download = `智途专属行程_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export poster:', error);
      alert('海报生成失败，请稍后再试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-[140px] flex flex-col bg-background-main h-full relative">
      {/* Export Button - Floating */}
      <button 
        onClick={handleExportPoster}
        disabled={isExporting || globalItinerary.length === 0}
        className={`fixed right-6 bottom-32 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl transition-all active:scale-95 ${
          isExporting || globalItinerary.length === 0
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-bold">生成中...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span className="text-sm font-bold">导出海报</span>
          </>
        )}
      </button>

      {/* Main Content Area for Capture */}
      <div ref={itineraryRef} className="bg-[#FAFAFA] flex flex-col min-h-full">
        {/* Top Half: Hero Banner with High Visual Impact */}
        <section 
          className="relative w-full h-[240px] shrink-0 overflow-hidden flex flex-col justify-end p-safe-margin pb-8"
          style={{ 
            backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="flex flex-col gap-1.5 animate-fade-in">
            <h1 className="text-white text-4xl font-black tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              我的专属行程
            </h1>
            <p className="text-white/90 text-sm font-bold flex items-center gap-2 drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)]">
              <span className="p-1 bg-primary rounded-md">
                <Compass className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </span>
              由智途 AI 为您独家定制
            </p>
          </div>
        </section>

        {/* Bottom Half: Scrollable Timeline */}
        <section className="flex-1 px-safe-margin flex flex-col mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-on-background tracking-tight">今日安排</h2>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-tighter">10 Oct 2024</span>
            </div>
          </div>

          <div className="relative flex-1 pb-10">
            {globalItinerary.length > 0 && (
              <div className="absolute left-[2.25rem] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/50 via-outline-variant/20 to-transparent rounded-full z-0"></div>
            )}
            
            <div className="flex flex-col gap-6 relative z-10 w-full overflow-hidden pb-4">
              {globalItinerary.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-10 text-center gap-6 animate-fade-in">
                  <div className="w-24 h-24 bg-surface-container rounded-3xl flex items-center justify-center text-primary/30 rotate-12 shadow-inner">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-on-surface font-black text-xl tracking-tight">行程单还是空的</p>
                    <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
                      快去和 <span className="text-primary font-bold">智途</span> 聊聊，<br />生成你的专属探险行程吧！✨
                    </p>
                  </div>
                </div>
              ) : (
                (Array.isArray(globalItinerary) ? globalItinerary : []).map((item, index) => (
                  <React.Fragment key={item.id || index}>
                    <div className="flex items-stretch group pr-1 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="w-20 shrink-0 flex flex-col items-end pr-6 relative py-3">
                        <span className="font-black text-[10px] text-on-background/40 leading-none">{getVirtualTime(index)}</span>
                        <div className="absolute right-[calc(-0.375rem+1px)] top-3.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10 shadow-md"></div>
                      </div>
                      <div className="flex-1 min-w-0 bg-white rounded-3xl p-3.5 shadow-sm border border-surface-variant/20 flex flex-row items-center gap-4 transition-all duration-300">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-gray-100">
                          <FallbackImage 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
                          <h3 className="text-base font-black text-on-background truncate leading-tight tracking-tight">{item.title}</h3>
                          <p className="text-[11px] font-bold text-on-surface-variant truncate mt-1.5 flex items-center gap-1.5 opacity-80">
                            <Info className="w-3 h-3 text-primary" /> {item.tags}
                          </p>
                          
                          {item.description && (
                            <div className="mt-3 bg-primary/5 p-3 rounded-2xl border border-primary/10 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-1 opacity-10">
                                <Sparkles className="w-8 h-8 text-primary" />
                              </div>
                              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <span className="w-1 h-1 bg-primary rounded-full"></span>
                                智途导游深度贴士
                              </h4>
                              <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed italic">
                                "{item.description}"
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center bg-primary/5 text-primary font-black text-[9px] px-2.5 py-1 rounded-lg border border-primary/10">
                              ⭐ {item.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {index < globalItinerary.length - 1 && (
                      <div className="flex items-center pl-20 pr-4 py-1">
                        <div className="flex flex-row items-center gap-2 text-on-surface-variant/60 bg-white rounded-full px-4 py-1.5 font-bold text-[9px] border border-outline-variant/10 shadow-sm">
                          <Car className="w-3.5 h-3.5" />
                          <span>{item.travelTimeToNext || '约 15 分钟车程'}</span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Poster Footer Watermark */}
        {globalItinerary.length > 0 && (
          <div className="mt-auto py-8 flex flex-col items-center gap-2 border-t border-dashed border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <Compass className="text-white w-4 h-4" />
              </div>
              <span className="font-display font-black text-primary tracking-tighter">智途 SmartTrek</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              ✨ 由 智途 AI 独家定制专属行程
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
