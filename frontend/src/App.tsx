import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Activity, 
  Home, 
  CandlestickChart, 
  Coins, 
  ShieldCheck, 
  HelpCircle, 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  Terminal, 
  Wallet, 
  Info, 
  Newspaper, 
  Plus, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  FileText,
  Lock,
  Mail,
  LogOut,
  User as UserIcon
} from 'lucide-react';

// Types
interface Coin {
  id: number;
  symbol: string;
  name: string;
  category: string;
  circulating: string;
  max: string;
  ratio: string;
  logo: string;
  web: string;
  paper: string;
  desc: string;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'resolved';
}

interface Order {
  id: number;
  pair: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  price: number;
  qty: number;
  status: 'PENDING' | 'FILLED';
}

interface Toast {
  id: number;
  title: string;
  msg: string;
  type: 'success' | 'error';
}

const BACKEND_URL = 'http://localhost:4000';

const staticCoinsFallback: Coin[] = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', category: 'LAYER 1', circulating: '19,700,000 BTC', max: '21,000,000 BTC', ratio: '93.8%', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', web: 'https://bitcoin.org', paper: 'https://bitcoin.org/bitcoin.pdf', desc: 'Bitcoin là đồng tiền điện tử đầu tiên, giải pháp lưu trữ tài sản phi tập trung.' },
  { id: 2, symbol: 'ETH', name: 'Ethereum', category: 'LAYER 1', circulating: '122,000,000 ETH', max: 'Vô Hạn', ratio: 'N/A', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', web: 'https://ethereum.org', paper: 'https://ethereum.org/whitepaper.pdf', desc: 'Ethereum là mạng lưới blockchain hợp đồng thông minh đầu tiên.' },
  { id: 3, symbol: 'USDT', name: 'Tether', category: 'STABLECOIN', circulating: '112,000,000,000 USDT', max: 'Vô Hạn', ratio: 'N/A', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png', web: 'https://tether.to', paper: 'https://tether.to/whitepaper.pdf', desc: 'Đồng đô la điện tử ổn định giá.' },
  { id: 4, symbol: 'SOL', name: 'Solana', category: 'LAYER 1', circulating: '461,000,000 SOL', max: 'Vô Hạn', ratio: 'N/A', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png', web: 'https://solana.com', paper: 'https://solana.com/solana-whitepaper.pdf', desc: 'Solana là blockchain hiệu năng siêu cao, tốc độ cực nhanh, phí rẻ.' }
];

export default function App() {
  // Authentication & Session state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginLoading, setLoginError] = useState<string>('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [fullNameInput, setFullNameInput] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'landing' | 'trade' | 'coin' | 'kyc' | 'support' | 'admin'>('landing');
  const [coins, setCoins] = useState<Coin[]>(staticCoinsFallback);
  const [activeCoinId, setActiveCoinId] = useState<number>(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [currentPair, setCurrentPair] = useState<string>('BTC_USDT');
  const [currentSide, setCurrentSide] = useState<'buy' | 'sell'>('buy');
  const [currentType, setCurrentType] = useState<'limit' | 'market'>('limit');
  const [tradePrice, setTradePrice] = useState<string>('67500.00');
  const [tradeQty, setTradeQty] = useState<string>('');
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [tradingFeeReduction, setTradingFeeReduction] = useState<number>(0);
  
  // KYC states
  const [kycForm, setKycForm] = useState({ name: '', idNumber: '', documentUrl: 'https://example.com/cccd.png' });
  
  // Tickets states
  const [ticketsList, setTicketsList] = useState<Ticket[]>([]);
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketCategory, setTicketCategory] = useState<string>('DEPOSIT');
  const [showTicketForm, setShowTicketForm] = useState<boolean>(false);

  // Live prices feed from server
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    BTC: 67500.00,
    ETH: 3500.00,
    USDT: 1.00,
    SOL: 145.00
  });

  // Spawn dynamic toast alert
  const spawnToast = (title: string, msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Perform API login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        spawnToast('Đăng Nhập Thành Công', `Chào mừng ${data.user.fullName} đã quay trở lại desu~! ヽ(>∀<☆)ノ`, 'success');
        
        // Dynamic redirection logic: Admin to operations desk, Customer to landing page desu~
        if (data.user.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('landing');
        }
      } else {
        setLoginError(data.message || 'Mật khẩu hoặc tài khoản sai desu~!');
        spawnToast('Đăng Nhập Thất Bại', data.message || 'Sai thông tin tài khoản!', 'error');
      }
    } catch (err) {
      setLoginError('Không thể kết nối đến server Backend desu~!');
      spawnToast('Lỗi Kết Nối Server', 'Vui lòng kiểm tra Server Backend có đang chạy không nhé Sếp!', 'error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput, fullName: fullNameInput })
      });
      const data = await res.json();
      if (data.success) {
        spawnToast('Đăng Ký Thành Công', 'Tài khoản của Sếp đã đăng ký và tạo ví thành công! Vui lòng đăng nhập nha desu~!', 'success');
        setAuthMode('login');
        setFullNameInput('');
        setLoginError('');
      } else {
        setLoginError(data.message || 'Lỗi đăng ký tài khoản desu~!');
        spawnToast('Đăng Ký Thất Bại', data.message || 'Đăng ký không thành công!', 'error');
      }
    } catch (err) {
      setLoginError('Không thể kết nối đến server Backend desu~!');
      spawnToast('Lỗi Kết Nối Server', 'Đăng ký thất bại do mất kết nối backend!', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmailInput('');
    setPasswordInput('');
    setLoginError('');
    setActiveTab('landing');
    spawnToast('Đăng Xuất Thành Công', 'Đã đăng xuất tài khoản VeloTrade desu~! 👋', 'success');
  };

  // Fetch coins from MySQL API on mount
  useEffect(() => {
    async function loadCoins() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/coins`);
        const data = await res.json();
        if (data.success && data.coins && data.coins.length > 0) {
          const mapped: Coin[] = data.coins.map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            category: coin.category.toUpperCase(),
            circulating: coin.circulating_supply ? `${parseFloat(coin.circulating_supply).toLocaleString()} ${coin.symbol}` : 'N/A',
            max: coin.max_supply ? `${parseFloat(coin.max_supply).toLocaleString()} ${coin.symbol}` : 'Vô Hạn',
            ratio: coin.max_supply ? `${((coin.circulating_supply / coin.max_supply) * 100).toFixed(1)}%` : 'N/A',
            logo: coin.logo_url || 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
            web: coin.website_url || '#',
            paper: coin.whitepaper_url || '#',
            desc: coin.description
          }));
          setCoins(mapped);
          setActiveCoinId(mapped[0].id);
        }
      } catch (err) {
        console.warn('API coins offline. Using fallback static seeds.');
      }
    }
    loadCoins();
  }, []);

  // Sync Support Tickets from database
  const loadTickets = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tickets`);
      const data = await res.json();
      if (data.success && data.tickets) {
        setTicketsList(data.tickets.map((t: any) => ({
          id: `TKT-${t.id}`,
          subject: t.subject,
          category: t.category,
          status: t.status
        })));
      }
    } catch (err) {
      console.warn('REST API tickets offline.');
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadTickets();
    }
  }, [activeTab, currentUser]);

  // Connect to WebSockets Server
  useEffect(() => {
    let socket: Socket;
    let fallbackInterval: any;

    try {
      socket = io(BACKEND_URL);

      socket.on('connect', () => {
        setWsConnected(true);
      });

      socket.on('price_update', (data: any[]) => {
        if (!Array.isArray(data)) return;
        setLivePrices(prev => {
          const next = { ...prev };
          data.forEach(update => {
            const sym = update.symbol.split('_')[0];
            next[sym] = update.price;
          });
          return next;
        });
      });

      socket.on('initial_prices', (prices: Record<string, number>) => {
        setLivePrices(prices);
      });

      socket.on('disconnect', () => {
        setWsConnected(false);
      });

      socket.on('connect_error', () => {
        setWsConnected(false);
      });

    } catch (err) {
      setWsConnected(false);
    }

    fallbackInterval = setInterval(() => {
      setLivePrices(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(sym => {
          if (sym === 'USDT') return;
          const fluctuation = (Math.random() - 0.5) * (next[sym] * 0.001);
          next[sym] = parseFloat((next[sym] + fluctuation).toFixed(sym === 'SHIB' ? 6 : 2));
        });
        return next;
      });
    }, 1200);

    return () => {
      if (socket) socket.disconnect();
      clearInterval(fallbackInterval);
    };
  }, []);

  // Update input price when active pair changes
  useEffect(() => {
    const symbol = currentPair.split('_')[0];
    const price = livePrices[symbol] || 67500;
    if (currentType === 'limit') {
      setTradePrice(price.toString());
    }
  }, [currentPair, currentType, livePrices]);

  const activeCoin = coins.find(c => c.id === activeCoinId) || coins[0];
  const activePairSymbol = currentPair.split('_')[0];
  const activePairPrice = livePrices[activePairSymbol] || 67500;

  // Trading functions
  const handlePlaceOrder = () => {
    if (maintenanceMode) {
      spawnToast('Bảo Trì Hệ Thống', 'Hiện tại hệ thống đang bảo trì, vui lòng giao dịch sau desu~.', 'error');
      return;
    }

    const qtyVal = parseFloat(tradeQty);
    if (!qtyVal || qtyVal <= 0) {
      spawnToast('Lỗi Đặt Lệnh', 'Vui lòng nhập số lượng giao dịch hợp lệ nha Sếp!', 'error');
      return;
    }

    const priceVal = currentType === 'limit' ? parseFloat(tradePrice) : activePairPrice;

    const newOrder: Order = {
      id: Math.floor(Math.random() * 90000) + 10000,
      pair: currentPair,
      side: currentSide.toUpperCase() as 'BUY' | 'SELL',
      type: currentType.toUpperCase() as 'LIMIT' | 'MARKET',
      price: priceVal,
      qty: qtyVal,
      status: currentType === 'limit' ? 'PENDING' : 'FILLED'
    };

    if (currentType === 'limit') {
      setOpenOrders(prev => [newOrder, ...prev]);
      spawnToast('Đã Đặt Lệnh Chờ', `Lệnh LIMIT ${currentSide.toUpperCase()} ${qtyVal} ${activePairSymbol} đã được đưa vào sổ lệnh!`, 'success');
    } else {
      spawnToast('Khớp Lệnh Thành Công', `Đã mua thành công ${qtyVal} ${activePairSymbol} với giá thị trường!`, 'success');
    }
    setTradeQty('');
  };

  const cancelOrder = (id: number) => {
    setOpenOrders(prev => prev.filter(o => o.id !== id));
    spawnToast('Hủy Lệnh', 'Đã hủy lệnh chờ khớp thành công desu~!', 'success');
  };

  // Submit support ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !currentUser) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, subject: ticketSubject, category: ticketCategory })
      });
      const data = await res.json();
      if (data.success) {
        spawnToast('Gửi Yêu Cầu Hỗ Trợ', 'Đã gửi ticket thành công! Yêu cầu đã được ghi vào MySQL Database.', 'success');
        setTicketSubject('');
        setShowTicketForm(false);
        loadTickets();
      }
    } catch (err) {
      const localTicket: Ticket = {
        id: `TKT-${Math.floor(Math.random() * 8999) + 1000}`,
        subject: ticketSubject,
        category: ticketCategory,
        status: 'open'
      };
      setTicketsList(prev => [localTicket, ...prev]);
      spawnToast('Gửi Ticket (Local)', 'Tạo yêu cầu hỗ trợ thành công (offline mode)!', 'success');
      setTicketSubject('');
      setShowTicketForm(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
    spawnToast('Duyệt Ticket', `Đã giải quyết thành công yêu cầu ${ticketId}!`, 'success');
  };

  // Submit KYC
  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycForm.name.trim() || !kycForm.idNumber.trim() || !currentUser) return;

    setCurrentUser(prev => prev ? { ...prev, kycStatus: 'pending' } : null);
    try {
      await fetch(`${BACKEND_URL}/api/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          fullName: kycForm.name,
          idNumber: kycForm.idNumber,
          documentUrl: kycForm.documentUrl
        })
      });
    } catch (err) {}
    spawnToast('Nộp Hồ Sơ KYC', 'Hồ sơ của Sếp đã nộp thành công và đang chờ Admin duyệt!', 'success');
  };

  const getAsksAndBids = () => {
    const asks = [];
    const bids = [];
    for (let i = 4; i > 0; i--) {
      asks.push({
        price: activePairPrice + (i * 1.5),
        qty: (Math.random() * 2 + 0.1).toFixed(4)
      });
    }
    for (let i = 1; i <= 4; i++) {
      bids.push({
        price: activePairPrice - (i * 1.5),
        qty: (Math.random() * 2 + 0.1).toFixed(4)
      });
    }
    return { asks, bids };
  };

  const { asks, bids } = getAsksAndBids();

  // RENDER LOGIN SCREEN IF NO USER IS LOGGED IN desu~!
  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg text-slate-200 overflow-hidden font-sans relative">
        {/* Neon blur shapes */}
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

              {loginLoading && (
                <p className="text-xs text-danger font-mono text-center">{loginLoading}</p>
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
            <form onSubmit={handleRegister} className="space-y-4">
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

              {loginLoading && (
                <p className="text-xs text-danger font-mono text-center">{loginLoading}</p>
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

          {/* Seed accounts quick reference box for Sếp desu~! */}
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

  // STANDARD AUTHENTICATED SYSTEM LAYOUT desu~!
  return (
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-bg text-slate-200">
      
      {/* Toast Overlay */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`glass-panel pointer-events-auto p-4 rounded-xl border-l-4 w-72 flex gap-3 shadow-2xl transition-all duration-300 ${t.type === 'success' ? 'border-l-success' : 'border-l-danger'}`}>
            {t.type === 'success' ? <CheckCircle className="w-5 h-5 text-success shrink-0" /> : <AlertTriangle className="w-5 h-5 text-danger shrink-0" />}
            <div>
              <p className="text-xs font-bold text-white">{t.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.msg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header Bar */}
      <header className="glass-panel shrink-0 border-b border-white/5 px-6 py-3 z-40">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <div onClick={() => setActiveTab('landing')} className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-secondary to-primary flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-bg rounded-[7px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                </div>
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">VeloTrade</span>
            </div>
            
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 border rounded-full text-[11px] ${wsConnected ? 'bg-success/10 border-success/15 text-success' : 'bg-amber-500/10 border-amber-500/15 text-amber-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-success animate-ping' : 'bg-amber-500'}`}></span>
              <span>{wsConnected ? 'WebSockets Live' : 'Database Connection Established'}</span>
              <span className="text-white/20">|</span>
              <span className="font-mono text-white/80">{wsConnected ? '1.8 ms' : 'Standalone Fallback'}</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 border border-white/5 rounded-xl">
            <button onClick={() => setActiveTab('landing')} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'landing' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'}`}>
              <Home className="w-3.5 h-3.5" /> Home
            </button>
            <button onClick={() => setActiveTab('trade')} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'trade' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'}`}>
              <CandlestickChart className="w-3.5 h-3.5" /> Sàn Giao Dịch
            </button>
            <button onClick={() => setActiveTab('coin')} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'coin' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'}`}>
              <Coins className="w-3.5 h-3.5" /> Chi Tiết Coin
            </button>
            <button onClick={() => setActiveTab('kyc')} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'kyc' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'}`}>
              <ShieldCheck className="w-3.5 h-3.5" /> Xác Thực KYC
            </button>
            <button onClick={() => setActiveTab('support')} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'support' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'}`}>
              <HelpCircle className="w-3.5 h-3.5" /> Trợ Giúp
            </button>
            
            {/* SECURED ADMIN TAB: ONLY visible to users with 'admin' role! desu~ */}
            {currentUser.role === 'admin' && (
              <button onClick={() => setActiveTab('admin')} className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'admin' ? 'text-primary bg-white/5 font-bold' : 'text-slate-400 hover:text-white'}`}>
                <Sliders className="w-3.5 h-3.5" /> Admin Operations
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {/* Logged in User info display desu~ */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-primary border border-white/10">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="text-left font-mono">
                <span className="text-[10px] font-bold text-white block leading-tight">{currentUser.fullName}</span>
                <span className="text-[8px] text-slate-400 block uppercase tracking-widest">{currentUser.role}</span>
              </div>
            </div>

            <button onClick={handleLogout} className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-white/5">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng Xuất</span>
            </button>
          </div>

        </div>
      </header>

      {/* Marquee Ticker */}
      <section className="bg-surface/85 border-b border-white/5 py-1.5 select-none overflow-hidden shrink-0">
        <div className="flex w-max animate-marquee">
          <div className="flex items-center gap-12 text-xs pr-12 font-mono">
            {coins.filter(c => c.symbol !== 'USDT').map((coin, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-white font-bold">{coin.symbol}/USDT</span>
                <span className="text-success">$ {(livePrices[coin.symbol] || 0).toLocaleString()}</span>
                <span className="text-success text-[10px] font-semibold">+2.45%</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-12 text-xs pr-12 font-mono">
            {coins.filter(c => c.symbol !== 'USDT').map((coin, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-white font-bold">{coin.symbol}/USDT</span>
                <span className="text-success">$ {(livePrices[coin.symbol] || 0).toLocaleString()}</span>
                <span className="text-success text-[10px] font-semibold">+2.45%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden relative">

        {/* 1. LANDING/HOME VIEW */}
        {activeTab === 'landing' && (
          <div className="h-full overflow-y-auto px-6 py-8 space-y-8">
            <div className="max-w-[1500px] mx-auto space-y-8">
              
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

              {/* Table rendering */}
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
                            <td className="px-6 py-3.5 text-xs"><span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5 font-display text-[10px] uppercase font-bold">{coin.category}</span></td>
                            <td className="px-6 py-3.5 text-right">
                              <button onClick={() => { setCurrentPair(`${coin.symbol}_USDT`); setActiveTab('trade'); }} className="bg-primary/10 hover:bg-primary text-primary hover:text-bg font-bold text-xs px-3 py-1.5 rounded transition-all">
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
        )}

        {/* 2. TRADING DASHBOARD VIEW */}
        {activeTab === 'trade' && (
          <div className="h-full flex flex-col lg:flex-row">
            {/* Pair Selector */}
            <aside className="w-full lg:w-56 border-r border-white/5 bg-surface/40 p-4 flex flex-col justify-between shrink-0">
              <div className="space-y-3">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider px-2 block">Cặp Giao Dịch Hot</span>
                <div className="space-y-1 overflow-y-auto max-h-[300px] custom-scroll">
                  {coins.filter(c => c.symbol !== 'USDT').map(coin => {
                    const curPrice = livePrices[coin.symbol] || 0;
                    const isActive = currentPair === `${coin.symbol}_USDT`;
                    return (
                      <button key={coin.id} onClick={() => setCurrentPair(`${coin.symbol}_USDT`)} className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex justify-between items-center ${isActive ? 'bg-white/5 text-primary border-l-2 border-primary' : 'text-slate-400 hover:text-white'}`}>
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
        )}

        {/* 3. COINS DETAIL VIEW (21 COINS FROM MYSQL) */}
        {activeTab === 'coin' && (
          <div className="h-full flex flex-col lg:flex-row">
            <aside className="w-full lg:w-56 border-r border-white/5 bg-surface/40 p-4 flex flex-col overflow-y-auto custom-scroll shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider px-2 mb-3 block font-bold">Danh Sách 21 Đồng Coin</span>
              <div className="space-y-1">
                {coins.map(coin => (
                  <button key={coin.id} onClick={() => setActiveCoinId(coin.id)} className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center gap-2 ${coin.id === activeCoinId ? 'bg-white/5 text-primary border-l-2 border-primary font-bold' : 'text-slate-400 hover:text-white'}`}>
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
        )}

        {/* 4. KYC PORTAL VIEW */}
        {activeTab === 'kyc' && (
          <div className="h-full overflow-y-auto px-6 py-8">
            <div className="max-w-[700px] mx-auto glass-panel rounded-xl p-6 border border-white/5 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold font-display text-white">Xác Thực Danh Tính (KYC)</h2>
                <p className="text-xs text-slate-400">Vui lòng hoàn tất xác thực danh tính để kích hoạt tài khoản giao dịch đầy đủ.</p>
              </div>

              {currentUser.kycStatus === 'verified' && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-5 text-center space-y-2">
                  <CheckCircle className="w-10 h-10 text-success mx-auto" />
                  <h3 className="text-sm font-bold text-success">Yêu Cầu KYC Của Sếp Đã Được Duyệt!</h3>
                  <p className="text-xs text-white/80">Tài khoản đã kích hoạt tất cả quyền hạn giao dịch tối cao.</p>
                </div>
              )}

              {currentUser.kycStatus === 'pending' && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-5 text-center space-y-2">
                  <Clock className="w-10 h-10 text-primary mx-auto animate-spin" />
                  <h3 className="text-sm font-bold text-primary">Đang Chờ Admin Phê Duyệt</h3>
                  <p className="text-xs text-white/80">Hồ sơ đã gửi thành công. Sếp có thể tự phê duyệt hồ sơ trong mục Admin Operations nha desu~!</p>
                </div>
              )}

              {currentUser.kycStatus === 'unverified' && (
                <form onSubmit={handleSubmitKYC} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase">Họ và Tên</label>
                      <input type="text" value={kycForm.name} onChange={(e) => setKycForm(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary text-xs" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase">Số CCCD / Hộ Chiếu</label>
                      <input type="text" value={kycForm.idNumber} onChange={(e) => setKycForm(prev => ({ ...prev, idNumber: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary text-xs" placeholder="0352XXXXXXXX" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase">Ảnh Mặt Trước CCCD (Đường Dẫn)</label>
                    <input type="text" value={kycForm.documentUrl} onChange={(e) => setKycForm(prev => ({ ...prev, documentUrl: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:border-primary text-xs" required />
                  </div>
                  <button type="submit" className="w-full bg-primary hover:opacity-90 text-bg font-bold font-display py-2.5 rounded-lg transition-all">
                    GỬI HỒ SƠ XÁC THỰC
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 5. SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <div className="h-full overflow-y-auto px-6 py-8">
            <div className="max-w-[800px] mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-lg font-bold font-display text-white">Trung Tâm Hỗ Trợ Khách Hàng (MySQL Linked)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Tạo yêu cầu trợ giúp và lưu trực tiếp vào cơ sở dữ liệu MySQL.</p>
                </div>
                <button onClick={() => setShowTicketForm(prev => !prev)} className="bg-primary hover:opacity-90 text-bg font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Tạo Ticket Mới
                </button>
              </div>

              {showTicketForm && (
                <div className="glass-panel rounded-xl p-5 border border-primary/20 space-y-4">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Tạo Yêu Cầu Trợ Giúp Mới</h3>
                  <form onSubmit={handleSubmitTicket} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase">Chủ Đề</label>
                        <input type="text" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase">Phân Loại</label>
                        <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)} className="w-full bg-[#111622] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary">
                          <option value="DEPOSIT">Nạp/Rút Tiền</option>
                          <option value="TRADING">Giao Dịch</option>
                          <option value="KYC">Xác Thực Danh Tính</option>
                          <option value="OTHER">Lỗi Khác</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="bg-primary text-bg font-bold px-4 py-2 rounded-lg text-xs hover:opacity-90 transition-all">GỬI TICKET</button>
                    <button type="button" onClick={() => setShowTicketForm(false)} className="bg-white/5 text-slate-400 px-4 py-2 rounded-lg text-xs hover:bg-white/10 transition-all ml-2">HỦY</button>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lịch Sử Yêu Cầu Của Sếp (Nạp từ MySQL)</h3>
                <div className="space-y-3">
                  {ticketsList.length === 0 ? (
                    <p className="text-center py-4 text-slate-500 text-xs">Chưa có yêu cầu hỗ trợ nào được ghi nhận.</p>
                  ) : (
                    ticketsList.map(t => (
                      <div key={t.id} className="glass-panel rounded-lg p-4 border border-white/5 flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{t.id}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] bg-primary/10 border border-primary/20 text-primary font-bold">{t.category}</span>
                          </div>
                          <p className="text-xs text-white">{t.subject}</p>
                        </div>
                        <div>
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${t.status === 'open' ? 'bg-success/15 text-success' : 'bg-slate-700 text-slate-400'}`}>{t.status.toUpperCase()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. ADMIN OPERATIONS VIEW */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="h-full overflow-y-auto px-6 py-8">
            <div className="max-w-[1400px] mx-auto space-y-6">
              
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-lg font-bold font-display text-white">VeloTrade Admin Management Operations</h2>
                <p className="text-xs text-slate-400 mt-0.5">Bảng điều khiển tối cao dành riêng cho Quản trị viên (Admin) để giám sát và duyệt hệ thống.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-primary" /> Cấu Hình Hệ Thống
                  </h3>
                  <div className="glass-panel rounded-xl p-4 border border-white/5 space-y-4 font-mono text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Chế độ bảo trì:</span>
                        <button onClick={() => setMaintenanceMode(prev => !prev)} className={`px-2.5 py-1 rounded transition-all text-[11px] font-bold ${maintenanceMode ? 'bg-danger/25 border border-danger text-danger' : 'bg-white/5 border border-white/10 text-slate-400'}`}>{maintenanceMode ? 'BẬT' : 'TẮT'}</button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Giảm phí giao dịch (%):</span>
                        <input type="number" value={tradingFeeReduction} onChange={(e) => setTradingFeeReduction(parseFloat(e.target.value) || 0)} className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white w-16 text-center focus:outline-none" />
                      </div>
                    </div>
                    <button onClick={() => spawnToast('Lưu cấu hình', `Đã cập nhật cấu hình hệ thống thành công!`, 'success')} className="w-full bg-primary hover:opacity-90 text-bg font-bold font-display py-2 rounded-lg text-xs transition-all">LƯU CẤU HÌNH</button>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Đang chờ duyệt KYC (Pending KYC)
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface/30">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase">
                            <th className="px-4 py-2.5">User</th>
                            <th className="px-4 py-2.5">CCCD/ID</th>
                            <th className="px-4 py-2.5">Hồ Sơ</th>
                            <th className="px-4 py-2.5 text-right">Duyệt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {currentUser.kycStatus !== 'pending' ? (
                            <tr><td colSpan={4} className="text-center py-4 text-slate-500">Không có yêu cầu duyệt danh tính nào.</td></tr>
                          ) : (
                            <tr className="hover:bg-white/5 transition-all">
                              <td className="px-4 py-2.5 text-white font-bold">{kycForm.name}</td>
                              <td className="px-4 py-2.5">{kycForm.idNumber}</td>
                              <td className="px-4 py-2.5 text-primary hover:underline cursor-pointer"><a href={kycForm.documentUrl} target="_blank" rel="noreferrer">Xem ảnh CCCD</a></td>
                              <td className="px-4 py-2.5 text-right flex gap-2 justify-end">
                                <button onClick={() => { setKycForm(prev => ({ ...prev, name: '', idNumber: '' })); setCurrentUser(prev => prev ? { ...prev, kycStatus: 'verified' } : null); spawnToast('KYC Phê Duyệt', 'Đã duyệt KYC thành công cho khách hàng!', 'success'); }} className="bg-success text-bg px-2.5 py-1 rounded font-bold hover:opacity-90">Duyệt</button>
                                <button onClick={() => { setKycForm(prev => ({ ...prev, name: '', idNumber: '' })); setCurrentUser(prev => prev ? { ...prev, kycStatus: 'unverified' } : null); spawnToast('KYC Từ Chối', 'Đã từ chối KYC thành công!', 'error'); }} className="bg-danger text-white px-2.5 py-1 rounded font-bold hover:opacity-90">Từ chối</button>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-primary" /> Yêu Cầu Hỗ Trợ Đang Mở (Support Tickets)
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-white/5 bg-surface/30">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-white/5 text-[10px] text-slate-400 uppercase">
                            <th className="px-4 py-2.5">Mã ID</th>
                            <th className="px-4 py-2.5">Chủ Đề</th>
                            <th className="px-4 py-2.5">Loại</th>
                            <th className="px-4 py-2.5">Trạng Thế</th>
                            <th className="px-4 py-2.5 text-right">Hành Động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {ticketsList.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-4 text-slate-500">Không có ticket nào cần xử lý.</td></tr>
                          ) : (
                            ticketsList.map(t => (
                              <tr key={t.id} className="hover:bg-white/5 transition-all">
                                <td className="px-4 py-2.5 text-white font-bold">{t.id}</td>
                                <td className="px-4 py-2.5">{t.subject}</td>
                                <td className="px-4 py-2.5 text-primary font-bold">{t.category}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'open' ? 'bg-success/10 text-success' : 'bg-slate-700 text-slate-400'}`}>{t.status}</span>
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  {t.status === 'open' ? (
                                    <button onClick={() => handleResolveTicket(t.id)} className="bg-primary text-bg px-2.5 py-1 rounded font-bold hover:opacity-90">Giải Quyết</button>
                                  ) : (
                                    <span className="text-slate-500">Đã xử lý</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel shrink-0 border-t border-white/5 py-3 px-6 text-center text-xs text-slate-500 z-40 font-mono">
        <p>© 2026 VeloTrade Inc. All rights reserved desu~.</p>
      </footer>

    </div>
  );
}
