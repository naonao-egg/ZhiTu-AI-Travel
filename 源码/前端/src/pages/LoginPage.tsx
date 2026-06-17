import React, { useState } from 'react';
import { useTravel } from '../context/TravelContext';
import { User as UserIcon, Lock, Compass, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { setCurrentUser } = useTravel();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { message: text }; // Fallback to raw text if JSON parsing fails
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || '操作失败，请重试');
      }

      setCurrentUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col items-center justify-center p-6 font-body-md animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl p-10 flex flex-col gap-8 relative overflow-hidden border border-emerald-100">
        {/* Background Decor */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-100 rounded-full blur-3xl"></div>

        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
            <Compass className="text-white w-9 h-9" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-black text-on-background tracking-tight">智途 AI</h1>
            <p className="text-emerald-600 font-bold text-sm flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              开启你的治愈系旅程
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">用户名</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-emerald-300"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-on-surface-variant/70 uppercase tracking-widest ml-1">密码</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-emerald-300"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl border border-red-100 animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? '立即登录' : '注册并开启旅程'
            )}
          </button>
        </form>

        <div className="flex justify-center items-center gap-2 relative z-10">
          <span className="text-xs text-text-muted font-medium">
            {isLogin ? '还没有账号？' : '已经有账号了？'}
          </span>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black text-primary hover:underline underline-offset-4"
          >
            {isLogin ? '点击注册' : '返回登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
