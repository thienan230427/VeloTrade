
import type { Coin } from '../types';

interface Props {
  coins: Coin[];
  livePrices: Record<string, number>;
}

export default function MarqueeTicker({ coins, livePrices }: Props) {
  const displayCoins = coins.filter(c => c.symbol !== 'USDT');
  
  return (
    <section className="bg-surface/85 border-b border-white/5 py-1.5 select-none overflow-hidden shrink-0">
      <div className="flex w-max animate-marquee">
        <div className="flex items-center gap-12 text-xs pr-12 font-mono">
          {displayCoins.map((coin, index) => (
            <div key={`stream1-${index}`} className="flex items-center gap-2">
              <span className="text-white font-bold">{coin.symbol}/USDT</span>
              <span className="text-success">$ {(livePrices[coin.symbol] || 0).toLocaleString()}</span>
              <span className="text-success text-[10px] font-semibold">+2.45%</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-12 text-xs pr-12 font-mono">
          {displayCoins.map((coin, index) => (
            <div key={`stream2-${index}`} className="flex items-center gap-2">
              <span className="text-white font-bold">{coin.symbol}/USDT</span>
              <span className="text-success">$ {(livePrices[coin.symbol] || 0).toLocaleString()}</span>
              <span className="text-success text-[10px] font-semibold">+2.45%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
