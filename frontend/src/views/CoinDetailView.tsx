
import { ExternalLink, FileText, Info, Newspaper } from 'lucide-react';
import type { Coin } from '../types';

interface Props {
  coins: Coin[];
  activeCoinId: number;
  setActiveCoinId: (v: number) => void;
}

export default function CoinDetailView({
  coins,
  activeCoinId,
  setActiveCoinId
}: Props) {
  const activeCoin = coins.find(c => c.id === activeCoinId) || coins[0];

  return (
    <div className="h-full flex flex-col lg:flex-row">
      <aside className="w-full lg:w-56 border-r border-white/5 bg-surface/40 p-4 flex flex-col overflow-y-auto custom-scroll shrink-0">
        <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider px-2 mb-3 block font-bold">Danh Sách 21 Đồng Coin</span>
        <div className="space-y-1">
          {coins.map(coin => (
            <button 
              key={coin.id} 
              onClick={() => setActiveCoinId(coin.id)} 
              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center gap-2 ${
                coin.id === activeCoinId ? 'bg-white/5 text-primary border-l-2 border-primary font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <img src={coin.logo} className="w-4.5 h-4.5 rounded-full shrink-0" alt="" />
              <span className="font-bold">{coin.name}</span>
              <span className="text-slate-500">({coin.symbol})</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex-grow overflow-y-auto custom-scroll p-6 space-y-6">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <img src={activeCoin.logo} className="w-10 h-10 rounded-full shrink-0" alt="coin" />
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{activeCoin.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full">{activeCoin.symbol}</span>
                </h2>
                <p className="text-xs text-slate-400 uppercase mt-0.5">{activeCoin.category}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <a href={activeCoin.web} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs hover:bg-white/10 transition-all flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> Website
              </a>
              <a href={activeCoin.paper} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs hover:bg-white/10 transition-all flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Whitepaper
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="glass-panel rounded-lg p-4 space-y-1">
              <span className="text-slate-400 text-[10px]">CUNG LƯU THÔNG</span>
              <p className="text-base font-bold text-white">{activeCoin.circulating}</p>
            </div>
            <div className="glass-panel rounded-lg p-4 space-y-1">
              <span className="text-slate-400 text-[10px]">CUNG TỐI ĐA</span>
              <p className="text-base font-bold text-white">{activeCoin.max}</p>
            </div>
            <div className="glass-panel rounded-lg p-4 space-y-1">
              <span className="text-slate-400 text-[10px]">TỶ LỆ LƯU THÔNG</span>
              <p className="text-base font-bold text-success">{activeCoin.ratio}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-primary" /> Mô Tả Chi Tiết (MySQL Connected)
            </h3>
            <div className="glass-panel rounded-lg p-5 leading-relaxed text-sm text-slate-300 whitespace-pre-line">
              {activeCoin.desc}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-primary" /> Tin Tức Liên Quan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-white">Tin Tức: Nâng cấp mạng lưới của {activeCoin.name} thành công tốt đẹp</h4>
                <p className="text-slate-400 text-[11px]">Bản nâng cấp giúp cải thiện tốc độ giao dịch đáng kể của {activeCoin.symbol}.</p>
                <span className="text-[10px] text-primary">Nguồn: VeloTrade Editorial</span>
              </div>
              <div className="glass-panel rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-white">Phân Tích: Lượng ví hoạt động của {activeCoin.symbol} tăng vọt</h4>
                <p className="text-slate-400 text-[11px]">Báo cáo on-chain ghi nhận dòng tiền đầu tư đổ mạnh vào {activeCoin.name}.</p>
                <span className="text-[10px] text-primary">Nguồn: VeloTrade Intelligence</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
