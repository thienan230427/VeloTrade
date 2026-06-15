
import { 
  Activity, 
  Home, 
  CandlestickChart, 
  Coins, 
  ShieldCheck, 
  HelpCircle, 
  Sliders, 
  User as UserIcon, 
  LogOut 
} from 'lucide-react';
import type { User } from '../types';

interface Props {
  currentUser: User;
  activeTab: 'landing' | 'trade' | 'coin' | 'kyc' | 'support' | 'admin';
  setActiveTab: (tab: 'landing' | 'trade' | 'coin' | 'kyc' | 'support' | 'admin') => void;
  wsConnected: boolean;
  handleLogout: () => void;
}

export default function Header({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  wsConnected, 
  handleLogout 
}: Props) {
  return (
    <header className="glass-panel shrink-0 border-b border-white/5 px-6 py-3 z-40">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div onClick={() => setActiveTab('landing')} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-secondary to-primary flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-bg rounded-[7px] flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
              </div>
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">VeloTrade</span>
          </div>
          
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 border rounded-full text-[11px] ${
            wsConnected ? 'bg-success/10 border-success/15 text-success' : 'bg-amber-500/10 border-amber-500/15 text-amber-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-success animate-ping' : 'bg-amber-500'}`}></span>
            <span>{wsConnected ? 'WebSockets Live' : 'Database Connection Established'}</span>
            <span className="text-white/20">|</span>
            <span className="font-mono text-white/80">{wsConnected ? '1.8 ms' : 'Standalone Fallback'}</span>
          </div>
        </div>

        {/* Tab switcher */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 border border-white/5 rounded-xl">
          <button 
            onClick={() => setActiveTab('landing')} 
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'landing' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" /> Home
          </button>
          <button 
            onClick={() => setActiveTab('trade')} 
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'trade' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CandlestickChart className="w-3.5 h-3.5" /> Sàn Giao Dịch
          </button>
          <button 
            onClick={() => setActiveTab('coin')} 
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'coin' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" /> Chi Tiết Coin
          </button>
          <button 
            onClick={() => setActiveTab('kyc')} 
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'kyc' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Xác Thực KYC
          </button>
          <button 
            onClick={() => setActiveTab('support')} 
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'support' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Trợ Giúp
          </button>
          
          {currentUser.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'admin' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Admin Operations
            </button>
          )}
        </nav>

        {/* User profile & logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-primary border border-white/10">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[10px] font-bold text-white block leading-tight">{currentUser.fullName}</span>
              <span className="text-[8px] text-slate-400 block uppercase tracking-widest">{currentUser.role}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-white/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng Xuất</span>
          </button>
        </div>

      </div>
    </header>
  );
}
