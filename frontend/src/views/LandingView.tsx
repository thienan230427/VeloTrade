
import { Sparkles, Terminal, TrendingUp } from 'lucide-react';
import type { Coin } from '../types';

interface Props {
  coins: Coin[];
  livePrices: Record<string, number>;
  wsConnected: boolean;
  setActiveTab: (tab: 'landing' | 'trade' | 'coin' | 'kyc' | 'support' | 'admin') => void;
  setCurrentPair: (v: string) => void;
}

export default function LandingView({
  coins,
  livePrices,
  wsConnected,
  setActiveTab,
  setCurrentPair
}: Props) {
  return (
    <div className="h-full overflow-y-auto px-6 py-8 space-y-8">
      <div className="max-w-[1500px] mx-auto space-y-8">
        
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] text-primary uppercase font-bold tracking-wider">
              <Sparkles className="w-3 h-3" /> HỆ THỐNG GIAO DỊCH HIỆU NĂNG CAO v4.5
            </div>
            <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Giao Dịch Crypto <br/>
              <span className="bg-gradient-to-r from-primary via-secondary to-purple-400 bg-clip-text text-transparent">Hiệu Năng Vượt Trội</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
              VeloTrade là một nền tảng chuyên nghiệp hoàn toàn bằng React JS, tích hợp dữ liệu thời gian thực và quản trị bằng MySQL Database, giúp Sếp Thiên Ân khởi nghiệp thành công!
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => setActiveTab('trade')} className="bg-primary hover:bg-primary/95 text-bg font-bold px-5 py-3 rounded-lg transition-all flex items-center gap-2">
                <span>Vào Sàn Giao Dịch Chuyên Nghiệp</span>
                <Terminal className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('coin')} className="glass-panel hover:bg-white/5 text-white font-medium px-5 py-3 rounded-lg transition-all flex items-center gap-2">
                <span>Xem Thông Tin Thị Trường (21 Coin)</span>
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Coin Rates Previews */}
          <div className="lg:col-span-5 relative">
            <div className="relative glass-panel rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 tracking-wider">MỨC GIÁ THỰC TẾ (WS FEED)</span>
                <span className="flex items-center gap-1 text-xs text-success font-medium">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping"></span>
                  <span>{wsConnected ? 'WebSockets Online' : 'Database Ready'}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {coins.slice(0, 4).map(coin => {
                  const curPrice = livePrices[coin.symbol] || 0;
                  return (
                    <div key={coin.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-2">
                        <img src={coin.logo} className="w-6 h-6 rounded-full shrink-0" alt="" />
                        <div>
                          <p className="text-xs font-bold text-white">{coin.symbol}</p>
                          <p className="text-[9px] text-slate-400">{coin.name}</p>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <p className="text-white font-bold">${curPrice.toLocaleString()}</p>
                        <p className="text-success text-[10px] font-medium">+1.8%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Featured table from MySQL */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold font-display text-white">Xu Hướng Tài Sản Thị Trường (Truy vấn từ MySQL)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Dữ liệu được cập nhật động và đồng bộ hoàn hảo trong trang React.</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  <th className="px-6 py-3">Tên Tài Sản</th>
                  <th className="px-6 py-3">Giá Hiện Tại (USDT)</th>
                  <th className="px-6 py-3">Thay Đổi 24h</th>
                  <th className="px-6 py-3">Thể Loại (Category)</th>
                  <th className="px-6 py-3 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-mono">
                {coins.map(coin => {
                  const curPrice = livePrices[coin.symbol] || 0;
                  return (
                    <tr key={coin.id} className="hover:bg-white/5 transition-all">
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <img src={coin.logo} className="w-6 h-6 rounded-full shrink-0" alt="" />
                        <div>
                          <span className="text-white font-bold block">{coin.name}</span>
                          <span className="text-slate-500 text-xs block font-mono">{coin.symbol}/USDT</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-white font-bold">${curPrice.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-success font-semibold">+2.45%</td>
                      <td className="px-6 py-3.5 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5 font-display text-[10px] uppercase font-bold">
                          {coin.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button 
                          onClick={() => { setCurrentPair(`${coin.symbol}_USDT`); setActiveTab('trade'); }} 
                          className="bg-primary/10 hover:bg-primary text-primary hover:text-bg font-bold text-xs px-3 py-1.5 rounded transition-all"
                        >
                          Giao Dịch
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
