import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// Imports types
import type { Coin, User, Ticket, Order, Toast } from './types';

// Global Components
import ToastContainer from './components/ToastContainer';
import Header from './components/Header';
import MarqueeTicker from './components/MarqueeTicker';

// Panel Views
import LoginView from './views/LoginView';
import LandingView from './views/LandingView';
import TradeView from './views/TradeView';
import CoinDetailView from './views/CoinDetailView';
import KycView from './views/KycView';
import SupportView from './views/SupportView';
import AdminView from './views/AdminView';

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
  const [loginError, setLoginError] = useState<string>('');

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
  const handleLogin = async (e: FormEvent) => {
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

  // Perform API Register
  const handleRegister = async (email: string, pass: string, name: string) => {
    setLoginError('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, fullName: name })
      });
      const data = await res.json();
      if (data.success) {
        spawnToast('Đăng Ký Thành Công', 'Tài khoản của Sếp đã đăng ký và tạo ví thành công! Vui lòng đăng nhập nha desu~!', 'success');
        setEmailInput(email);
        setPasswordInput(pass);
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
  const handleSubmitTicket = async (e: FormEvent) => {
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
  const handleSubmitKYC = async (e: FormEvent) => {
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

  // 1. RENDER LOGIN VIEW
  if (!currentUser) {
    return (
      <LoginView 
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        loginError={loginError}
        setLoginError={setLoginError}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
      />
    );
  }

  // 2. RENDER MAIN AUTHENTICATED WORKSPACE
  return (
    <div className="h-screen flex flex-col overflow-hidden text-sm bg-bg text-slate-200">
      
      {/* Toast Manager */}
      <ToastContainer toasts={toasts} />

      {/* Global Navbar Header */}
      <Header 
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wsConnected={wsConnected}
        handleLogout={handleLogout}
      />

      {/* Real-time Ticker */}
      <MarqueeTicker coins={coins} livePrices={livePrices} />

      {/* Dynamic Main Workspace routing views desu~ */}
      <main className="flex-grow overflow-hidden relative">
        
        {activeTab === 'landing' && (
          <LandingView 
            coins={coins}
            livePrices={livePrices}
            wsConnected={wsConnected}
            setActiveTab={setActiveTab}
            setCurrentPair={setCurrentPair}
          />
        )}

        {activeTab === 'trade' && (
          <TradeView 
            coins={coins}
            livePrices={livePrices}
            currentPair={currentPair}
            setCurrentPair={setCurrentPair}
            currentSide={currentSide}
            setCurrentSide={setCurrentSide}
            currentType={currentType}
            setCurrentType={setCurrentType}
            tradePrice={tradePrice}
            setTradePrice={setTradePrice}
            tradeQty={tradeQty}
            setTradeQty={setTradeQty}
            openOrders={openOrders}
            handlePlaceOrder={handlePlaceOrder}
            cancelOrder={cancelOrder}
            asks={asks}
            bids={bids}
          />
        )}

        {activeTab === 'coin' && (
          <CoinDetailView 
            coins={coins}
            activeCoinId={activeCoinId}
            setActiveCoinId={setActiveCoinId}
          />
        )}

        {activeTab === 'kyc' && (
          <KycView 
            currentUser={currentUser}
            kycForm={kycForm}
            setKycForm={setKycForm}
            handleSubmitKYC={handleSubmitKYC}
          />
        )}

        {activeTab === 'support' && (
          <SupportView 
            ticketsList={ticketsList}
            showTicketForm={showTicketForm}
            setShowTicketForm={setShowTicketForm}
            ticketSubject={ticketSubject}
            setTicketSubject={setTicketSubject}
            ticketCategory={ticketCategory}
            setTicketCategory={setTicketCategory}
            handleSubmitTicket={handleSubmitTicket}
          />
        )}

        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <AdminView 
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            kycForm={kycForm}
            setKycForm={setKycForm}
            ticketsList={ticketsList}
            handleResolveTicket={handleResolveTicket}
            maintenanceMode={maintenanceMode}
            setMaintenanceMode={setMaintenanceMode}
            tradingFeeReduction={tradingFeeReduction}
            setTradingFeeReduction={setTradingFeeReduction}
            spawnToast={spawnToast}
          />
        )}

      </main>

      {/* Reusable Footer */}
      <footer className="glass-panel shrink-0 border-t border-white/5 py-3 px-6 text-center text-xs text-slate-500 z-40 font-mono">
        <p>© 2026 VeloTrade Inc. All rights reserved desu~.</p>
      </footer>

    </div>
  );
}
