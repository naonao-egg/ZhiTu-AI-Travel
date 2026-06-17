import React, { useState, useEffect, useRef } from 'react';
import { Message, RecommendationCard } from '../types/chat';
import { chatService } from '../services/chat';
import { Send, Mic, Star, Sparkles, Loader2, BrainCircuit, X } from 'lucide-react';
import { useTravel } from '../context/TravelContext';
import { FallbackImage } from '../components/FallbackImage';
import { UserPreference, preferenceService } from '../services/preference';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1506744626753-eba7bc3535f6?q=80&w=400&auto=format&fit=crop";

export default function ExplorePage() {
  const { addToItinerary, currentUser, currentTripId, resetTrip } = useTravel();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);

  const fetchPreferences = async () => {
    if (currentUser?.username) {
      const prefs = await preferenceService.getPreferences(currentUser.username);
      setPreferences(prefs);
    }
  };

  const handleDeletePref = async (id: number) => {
    const success = await preferenceService.deletePreference(id);
    if (success) {
      setPreferences(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleOpenPrefs = () => {
    fetchPreferences();
    setShowPrefModal(true);
  };

  // Initialize with initial greeting if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      const initMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `你好，${currentUser?.username || '旅行者'}！我是你的智途 AI 助手。今天想去哪里探索？`,
        type: 'text',
        timestamp: Date.now(),
      };
      setMessages([initMessage]);
    }
  }, [currentTripId, currentUser?.username]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleStartNewTrip = () => {
    resetTrip();
    setMessages([]); // Clear local messages
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      type: 'text',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Pass currentTripId and username to backend for memory isolation and history
      const aiResponse = await chatService.sendMessage(inputValue, currentTripId, currentUser?.username);
      setMessages((prev) => [...prev, aiResponse]);
      
      // Update global itinerary if we got recommendations
      if (aiResponse.type === 'recommendations' && aiResponse.recommendations) {
        addToItinerary(aiResponse.recommendations);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '系统开小差了，请稍后再试',
        type: 'text',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-safe-margin pb-[180px] pt-stack-md flex flex-col gap-stack-lg no-scrollbar bg-background-main h-full">
      {/* Greeting Section */}
      <section className="flex flex-col gap-stack-sm animate-fade-in relative">
        <div className="flex justify-between items-start">
          <h2 className="font-display text-display text-on-background leading-tight">
            早上好，{currentUser?.username || '旅行者'}！<br />准备好开启下一段旅程了吗？✈️
          </h2>
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleStartNewTrip}
              className="bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-primary/20 transition-all active:scale-95 shadow-sm border border-primary/5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              开始新旅途
            </button>
            <button 
              onClick={handleOpenPrefs}
              className="bg-purple-50 text-purple-600 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-purple-100 transition-all active:scale-95 shadow-sm border border-purple-100 shrink-0"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              记忆碎片
            </button>
          </div>
        </div>
      </section>

      {/* Quick Prompt Chips */}
      <section className="-mx-safe-margin px-safe-margin">
        <div className="flex gap-stack-sm overflow-x-auto snap-x no-scrollbar pb-2">
          {['⛰️ 周末游', '🍜 地道美食', '🏖️ 海岛度假', '📸 摄影打卡'].map((chip, idx) => (
            <button 
              key={idx} 
              onClick={() => setInputValue(chip.split(' ')[1])}
              className="shrink-0 snap-start bg-surface-card border border-outline-variant/50 rounded-full px-5 py-2.5 flex items-center gap-2 shadow-tint hover:bg-surface-container transition-colors active:scale-95"
            >
              <span className="text-lg">{chip.split(' ')[0]}</span>
              <span className="font-h2 text-h2 text-on-surface text-sm">{chip.split(' ')[1]}</span>
            </button>
          ))}
          <div className="shrink-0 w-safe-margin"></div>
        </div>
      </section>

      {/* Chat Stream */}
      <section className="flex flex-col gap-stack-lg">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-stack-sm w-full">
            {msg.role === 'user' ? (
              /* User Bubble */
              <div className="flex justify-end w-full animate-fade-in">
                <div className="bg-user-bubble-bg text-text-dark rounded-2xl rounded-br-sm px-5 py-3.5 max-w-[85%] shadow-sm font-body-md text-body-md">
                  {msg.content}
                </div>
              </div>
            ) : (
              /* AI Response Bubble */
              <div className="flex flex-col items-start gap-stack-sm w-full animate-fade-in">
                {msg.content && (
                  <div className={`rounded-2xl rounded-bl-sm px-5 py-3.5 max-w-[90%] shadow-tint font-body-md text-body-md border ${
                    msg.id.startsWith('error-') 
                      ? 'bg-error-container text-error border-error/20' 
                      : 'bg-surface-card text-on-background border-surface-variant/30'
                  }`}>
                    {msg.content}
                  </div>
                )}

                {msg.weather && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm border border-blue-200 mt-1 mb-2 w-full max-w-[90%] animate-fade-in relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 p-2 opacity-20 transform rotate-12">
                       <span className="text-7xl">🌤️</span>
                    </div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <span className="font-black text-blue-900 text-lg tracking-tight">{msg.weather.city} 天气</span>
                      <div className="flex items-center gap-1.5 text-blue-800 bg-white/60 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm border border-white">
                         <span className="text-sm">🌡️</span>
                         <span>{msg.weather.temperature}℃</span>
                         <span className="w-1 h-1 bg-blue-400/50 rounded-full mx-0.5"></span>
                         <span>{msg.weather.condition}</span>
                      </div>
                    </div>
                    <div className="text-xs text-blue-900/80 leading-relaxed bg-white/50 p-2.5 rounded-lg border border-white/60 flex items-start gap-2 relative z-10 shadow-sm backdrop-blur-sm font-medium">
                       <span className="shrink-0 mt-0.5 text-base drop-shadow-sm">🧥</span>
                       <span className="leading-normal">{msg.weather.advice}</span>
                    </div>
                  </div>
                )}

                {msg.type === 'recommendations' && msg.recommendations && (
                  /* Rich Media Carousel */
                  <div className="flex gap-stack-md overflow-x-auto snap-x no-scrollbar w-full py-2 -mx-2 px-2">
                    {msg.recommendations.map((rec) => (
                      <div key={rec.id} className="shrink-0 w-[220px] snap-start bg-surface-card rounded-xl overflow-hidden shadow-tint border border-surface-variant/30 flex flex-col group cursor-pointer">
                        <div className="relative w-full aspect-[4/3] bg-surface-container-low overflow-hidden">
                          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                            <FallbackImage 
                              src={rec.imageUrl} 
                              alt={rec.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute top-2 right-2 bg-surface-card/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                            <Star className="text-[#F59E0B] w-3.5 h-3.5 fill-[#F59E0B]" />
                            <span className="font-label-caps text-label-caps text-on-surface font-bold">{rec.rating || '0.0'}</span>
                          </div>
                        </div>
                        <div className="p-3 flex flex-col gap-1.5">
                          <h3 className="font-h2 text-h2 text-on-background text-base truncate font-bold">
                            {rec.title || '未知地点'}
                          </h3>
                          <p className="font-body-md text-body-md text-text-muted text-xs truncate">
                            {rec.tags || '暂无标签'}
                          </p>
                          {rec.description && (
                            <div className="flex items-start gap-1 mt-1 bg-surface-container-lowest/50 p-1.5 rounded-lg border border-outline-variant/5">
                              <span className="text-xs shrink-0 mt-0.5">💡</span>
                              <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                {rec.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="shrink-0 w-2"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start gap-stack-sm w-full animate-pulse">
            <div className="bg-surface-card text-on-background rounded-2xl rounded-bl-sm px-5 py-3.5 max-w-[40%] shadow-tint border border-surface-variant/30">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-outline-variant rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-outline-variant rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-outline-variant rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Pill-shaped Input Area */}
      <div className="fixed bottom-[100px] left-0 w-full px-safe-margin z-40">
        <div className="absolute inset-0 -top-10 bg-gradient-to-t from-background-main via-background-main to-transparent -z-10 pointer-events-none"></div>
        <div className="bg-surface-card rounded-full shadow-lg border border-outline-variant/20 flex items-center p-1.5 pl-5 transition-shadow focus-within:shadow-xl focus-within:border-primary/30">
          <input 
            className="flex-1 bg-transparent border-none outline-none font-body-md text-body-md text-on-background placeholder:text-outline p-0 focus:ring-0" 
            placeholder="输入你想去的地方或心情..." 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send Message" 
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ml-2 shadow-lg ${
              isLoading || !inputValue.trim() 
                ? 'bg-surface-container text-outline-variant cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90 hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPrefModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2 text-purple-800">
                <BrainCircuit className="w-5 h-5" />
                <h3 className="font-bold text-lg">智途的记忆碎片</h3>
              </div>
              <button onClick={() => setShowPrefModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                这是智途在与您的对话中默默记下的长期偏好。它会在未来的行程规划中严格参考这些标签。如果您不喜欢某个标签，可以随时让智途“遗忘”。
              </p>
              {preferences.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <span className="text-4xl block mb-2">🍃</span>
                  暂无记忆标签
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {preferences.map(pref => (
                    <div key={pref.id} className="bg-purple-100/60 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-sm animate-fade-in">
                      <span className="font-medium">{pref.preferenceText}</span>
                      <button 
                        onClick={() => handleDeletePref(pref.id)}
                        className="text-purple-400 hover:text-purple-700 hover:bg-purple-200/50 rounded-full p-0.5 transition-colors"
                        title="遗忘"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
