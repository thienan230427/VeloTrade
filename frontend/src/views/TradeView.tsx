
import { CandlestickChart, Wallet } from 'lucide-react';
import type { Coin, Order } from '../types';

interface Props {
  coins: Coin[];
  livePrices: Record<string, number>;
  currentPair: string;
  setCurrentPair: (v: string) => void;
  currentSide: 'buy' | 'sell';
  setCurrentSide: (v: 'buy' | 'sell') => void;
  currentType: 'limit' | 'market';
  setCurrentType: (v: 'limit' | 'market') => void;
  tradePrice: string;
  setTradePrice: (v: string) => void;
  tradeQty: string;
  setTradeQty: (v: string) => void;
  openOrders: Order[];
  handlePlaceOrder: () => void;
  cancelOrder: (id: number) => void;
  asks: { price: number; qty: string }[];
  bids: { price: number; qty: string }[];
}

export default function TradeView({
  coins,
  livePrices,
  currentPair,
  setCurrentPair,
  currentSide,
  setCurrentSide,
  currentType,
  setCurrentType,
  tradePrice,
  setTradePrice,
  tradeQty,
  setTradeQty,
  openOrders,
  handlePlaceOrder,
  cancelOrder,
  asks,
  bids
}: Props) {
  const activePairSymbol = currentPair.split('_')[0];
  const activePairPrice = livePrices[activePairSymbol] || 67500;

  return (
    <div className="h-full flex flex-col lg:flex-row">
      
      {/* Pair Selector */}
      <aside className="w-full lg:w-56 border-r border-white/5 bg-surface/40 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-3">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider px-2 block font-bold">Cặp Giao Dịch Hot</span>
          <div className="space-y-1 overflow-y-auto max-h-[300px] custom-scroll">
            {coins.filter(c => c.symbol !== 'USDT').map(coin => {
              const curPrice = livePrices[coin.symbol] || 0;
              const isActive = currentPair === `${coin.symbol}_USDT`;
              return (
                <button 
                  key={coin.id} 
                  onClick={() => setCurrentPair(`${coin.symbol}_USDT`)} 
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex justify-between items-center ${
                    isActive ? 'bg-white/5 text-primary border-l-2 border-primary' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold">{coin.symbol}/USDT</span>
                  <span className="font-mono">${curPrice.toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="glass-panel rounded-lg p-3 space-y-2 font-mono mt-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <span className="text-xs text-slate-400">Số Dư Tài Sản</span>
            <Wallet className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span>USDT</span><span className="text-white font-bold">120,480.00 USDT</span></div>
            <div className="flex justify-between"><span>BTC</span><span className="text-white font-bold">0.324 BTC</span></div>
            <div className="flex justify-between"><span>ETH</span><span className="text-white font-bold">4.120 ETH</span></div>
            <div className="flex justify-between"><span>SOL</span><span className="text-white font-bold">25.500 SOL</span></div>
          </div>
        </div>
      </aside>

      {/* Central Desk */}
      <section className="flex-grow flex flex-col overflow-hidden min-w-0">
        <div className="border-b border-white/5 p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs bg-surface/20">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold font-display text-white">{currentPair.replace('_', '/')}</span>
            <span className="text-base font-bold text-success">${activePairPrice.toLocaleString()}</span>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Thay Đổi 24h</span>
              <span className="text-success font-semibold">+2.45%</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Cao Nhất</span>
              <span className="text-white font-semibold">${(activePairPrice * 1.01).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Thấp Nhất</span>
              <span className="text-white font-semibold">${(activePairPrice * 0.99).toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          <div className="lg:col-span-8 flex flex-col overflow-hidden border-r border-white/5">
            <div className="flex-grow relative bg-[#090D14]/90 p-4 flex flex-col justify-center items-center text-center">
              <div className="space-y-2">
                <CandlestickChart className="w-12 h-12 text-primary animate-pulse mx-auto" />
                <h3 className="text-base font-bold text-white font-display">Biểu Đồ Sàn Giao Dịch</h3>
                <p className="text-xs text-slate-400 max-w-sm">Tích hợp dữ liệu và biểu đồ nến thời gian thực của cặp {currentPair.replace('_', '/')}.</p>
                <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-bold text-primary font-mono">
                  {currentPair.replace('_', '/')}: ${activePairPrice.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Open Orders */}
            <div className="h-44 border-t border-white/5 bg-surface/20 flex flex-col overflow-hidden">
              <div className="border-b border-white/5 px-4 py-2 flex items-center justify-between bg-surface/40">
                <span className="text-xs font-semibold text-white">Sổ Lệnh Chờ Giao Dịch (Open Orders)</span>
                <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[10px] rounded-full">{openOrders.length} Orders</span>
              </div>
              <div className="flex-grow overflow-y-auto custom-scroll p-4">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-slate-400 border-b border-white/5 pb-1.5 uppercase tracking-wider">
                      <th className="pb-1">Cặp Coin</th>
                      <th className="pb-1">Loại</th>
                      <th className="pb-1">Phân Hệ</th>
                      <th className="pb-1">Giá Khớp</th>
                      <th className="pb-1">Số Lượng</th>
                      <th className="pb-1">Trạng Thái</th>
                      <th className="pb-1 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {openOrders.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-4 text-slate-500">Không có lệnh chờ nào.</td></tr>
                    ) : (
                      openOrders.map(order => (
                        <tr key={order.id} className="hover:bg-white/5 transition-all">
                          <td className="py-2 text-white font-bold">{order.pair}</td>
                          <td className="py-2 text-xs">{order.type}</td>
                          <td className={`py-2 ${order.side === 'BUY' ? 'text-success' : 'text-danger'} font-semibold`}>{order.side}</td>
                          <td className="py-2">${order.price.toLocaleString()}</td>
                          <td className="py-2">{order.qty}</td>
                          <td className="py-2 text-primary font-bold">{order.status}</td>
                          <td className="py-2 text-right">
                            <button onClick={() => cancelOrder(order.id)} className="text-danger hover:underline">Hủy</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Live Order Book */}
          <div className="lg:col-span-4 flex flex-col overflow-hidden">
            <div className="border-b border-white/5 px-4 py-2 bg-surface/40 text-xs font-semibold text-white">
              Sổ Lệnh Thị Trường (Live Order Book)
            </div>
            <div className="flex-grow overflow-y-auto custom-scroll p-4 font-mono text-xs space-y-3">
              <div className="space-y-0.5 text-danger">
                {asks.map((ask, idx) => (
                  <div key={idx} className="flex justify-between hover:bg-white/5 px-2 py-0.5 rounded transition-all">
                    <span>${ask.price.toFixed(2)}</span>
                    <span className="text-slate-400">{ask.qty}</span>
                  </div>
                ))}
              </div>
              <div className="py-2 border-y border-white/5 text-center flex items-center justify-between">
                <span className="text-slate-500 uppercase text-[9px]">Mid Price</span>
                <span className="text-sm font-bold text-success">${activePairPrice.toLocaleString()}</span>
              </div>
              <div className="space-y-0.5 text-success">
                {bids.map((bid, idx) => (
                  <div key={idx} className="flex justify-between hover:bg-white/5 px-2 py-0.5 rounded transition-all">
                    <span>${bid.price.toFixed(2)}</span>
                    <span className="text-slate-400">{bid.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trading inputs panel */}
      <aside className="w-full lg:w-72 border-l border-white/5 bg-surface/30 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div className="flex bg-white/5 rounded-lg p-0.5">
            <button onClick={() => setCurrentSide('buy')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${currentSide === 'buy' ? 'bg-success text-white' : 'text-slate-400 hover:text-white'}`}>MUA</button>
            <button onClick={() => setCurrentSide('sell')} className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${currentSide === 'sell' ? 'bg-danger text-white' : 'text-slate-400 hover:text-white'}`}>BÁN</button>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Phương Thức:</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentType('limit')} className={`px-2 py-0.5 rounded border text-[10px] font-bold ${currentType === 'limit' ? 'border-primary text-primary' : 'border-white/10 text-slate-400'}`}>LIMIT</button>
              <button onClick={() => setCurrentType('market')} className={`px-2 py-0.5 rounded border text-[10px] font-bold ${currentType === 'market' ? 'border-primary text-primary' : 'border-white/10 text-slate-400'}`}>MARKET</button>
            </div>
          </div>

          <div className="space-y-3 font-mono">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Giá Đặt (USDT)</label>
              <div className="relative rounded-lg bg-white/5 border border-white/10 px-3 py-2 flex items-center">
                <input type="text" disabled={currentType === 'market'} value={currentType === 'market' ? 'MKT PRICE' : tradePrice} onChange={(e) => setTradePrice(e.target.value)} className="bg-transparent w-full focus:outline-none text-white text-sm" />
                <span className="text-slate-500 text-xs select-none">USDT</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase">Số Lượng</label>
              <div className="relative rounded-lg bg-white/5 border border-white/10 px-3 py-2 flex items-center">
                <input type="number" step="any" placeholder="0.00" value={tradeQty} onChange={(e) => setTradeQty(e.target.value)} className="bg-transparent w-full focus:outline-none text-white text-sm" />
                <span className="text-slate-500 text-xs select-none">{activePairSymbol}</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 pt-1">
              <span>Tổng Cộng:</span>
              <span className="text-white font-bold">${((parseFloat(tradeQty) || 0) * (currentType === 'limit' ? (parseFloat(tradePrice) || 0) : activePairPrice)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        <button onClick={handlePlaceOrder} className={`w-full font-bold font-display py-3 rounded-lg transition-all mt-4 ${currentSide === 'buy' ? 'bg-success text-bg hover:opacity-90' : 'bg-danger text-white hover:opacity-90'}`}>
          THỰC HIỆN LỆNH {currentSide === 'buy' ? 'MUA' : 'BÁN'}
        </button>
      </aside>
    </div>
  );
}
