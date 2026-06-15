import type { FormEvent } from 'react';
import { useState } from 'react';
import { Mail, Lock, User as UserIcon, Activity } from 'lucide-react';

interface Props {
  emailInput: string;
  setEmailInput: (v: string) => void;
  passwordInput: string;
  setPasswordInput: (v: string) => void;
  loginError: string;
  setLoginError: (v: string) => void;
  handleLogin: (e: FormEvent) => void;
  handleRegister: (email: string, pass: string, name: string) => void;
}

export default function LoginView({
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  loginError,
  setLoginError,
  handleLogin,
  handleRegister
}: Props) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [fullNameInput, setFullNameInput] = useState<string>('');

  const onRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleRegister(emailInput, passwordInput, fullNameInput);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-bg text-slate-200 overflow-hidden font-sans relative">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] top-10 left-10"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-secondary/10 blur-[120px] bottom-10 right-10"></div>
      
      <div className="w-[450px] glass-panel rounded-2xl p-8 border border-white/5 space-y-6 shadow-2xl relative z-10">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center p-[1px] mx-auto shadow-lg shadow-primary/20">
            <div className="w-full h-full bg-bg rounded-[15px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white mt-3">
            {authMode === 'login' ? 'Chào mừng Sếp đến VeloTrade' : 'Đăng Ký Tài Khoản VeloTrade'}
          </h1>
          <p className="text-xs text-slate-400">
            {authMode === 'login' ? 'Vui lòng đăng nhập hệ thống sàn giao dịch Web3' : 'Tự tạo tài khoản khách hàng mới vào MySQL Database desu~'}
          </p>
        </div>

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Email Đăng Nhập</label>
              <div className="relative rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 flex items-center gap-2 focus-within:border-primary transition-all">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="email" 
                  placeholder="admin@velotrade.com" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-white text-xs" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Mật Khẩu</label>
              <div className="relative rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 flex items-center gap-2 focus-within:border-primary transition-all">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-white text-xs" 
                  required 
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-danger font-mono text-center">{loginError}</p>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold font-display py-3 rounded-lg hover:opacity-95 transition-all text-xs shadow-lg shadow-primary/10">
              ĐĂNG NHẬP HỆ THỐNG
            </button>

            <p className="text-center text-xs text-slate-400">
              Chưa có tài khoản?{' '}
              <span onClick={() => { setAuthMode('register'); setLoginError(''); }} className="text-primary hover:underline cursor-pointer font-bold">
                Đăng ký ngay desu~!
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={onRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Họ và Tên</label>
              <div className="relative rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 flex items-center gap-2 focus-within:border-primary transition-all">
                <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Nguyễn Văn A" 
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-white text-xs" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Email Đăng Ký</label>
              <div className="relative rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 flex items-center gap-2 focus-within:border-primary transition-all">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="email" 
                  placeholder="user@example.com" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-white text-xs" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Mật Khẩu</label>
              <div className="relative rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 flex items-center gap-2 focus-within:border-primary transition-all">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-white text-xs" 
                  required 
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-danger font-mono text-center">{loginError}</p>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold font-display py-3 rounded-lg hover:opacity-95 transition-all text-xs shadow-lg shadow-primary/10">
              ĐĂNG KÝ KHÁCH HÀNG MỚI
            </button>

            <p className="text-center text-xs text-slate-400">
              Đã có tài khoản?{' '}
              <span onClick={() => { setAuthMode('login'); setLoginError(''); }} className="text-primary hover:underline cursor-pointer font-bold">
                Đăng nhập ngay desu~!
              </span>
            </p>
          </form>
        )}

        {authMode === 'login' && (
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 space-y-2 font-mono text-[11px] text-slate-400">
            <p className="font-bold text-slate-200">📌 Tài Khoản Thử Nghiệm Từ MySQL Seed:</p>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>🧑‍💼 ADMIN:</span>
              <span className="text-primary hover:underline cursor-pointer" onClick={() => { setEmailInput('admin@velotrade.com'); setPasswordInput('admin123'); }}>admin@velotrade.com / admin123</span>
            </div>
            <div className="flex justify-between">
              <span>👤 CUSTOMER:</span>
              <span className="text-secondary hover:underline cursor-pointer" onClick={() => { setEmailInput('customer@velotrade.com'); setPasswordInput('customer123'); }}>customer@velotrade.com / customer123</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
