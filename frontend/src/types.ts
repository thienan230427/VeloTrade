export interface Coin {
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

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'resolved';
}

export interface Order {
  id: number;
  pair: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  price: number;
  qty: number;
  status: 'PENDING' | 'FILLED';
}

export interface Toast {
  id: number;
  title: string;
  msg: string;
  type: 'success' | 'error';
}
