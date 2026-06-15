import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// MySQL connection pool configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Thienan23042007@',
  database: 'velo_trade',
  port: 3306
};

let pool: mysql.Pool;

async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('⚡ Connected beautifully to local MySQL (velo_trade) database! (◕‿◕✿)');
  } catch (err) {
    console.error('❌ Failed to connect to MySQL database:', err);
  }
}

// REST APIs

// 1. User Authentication (Login)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email không tồn tại trên hệ thống desu~!' });
    }
    const user = rows[0];
    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác desu~!' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        kycStatus: user.kyc_status
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get all coins from the MySQL database
app.get('/api/coins', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coins WHERE is_active = TRUE');
    res.json({ success: true, coins: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Submit KYC
app.post('/api/kyc', async (req, res) => {
  const { userId, fullName, idNumber, documentUrl } = req.body;
  try {
    console.log(`[KYC SUBMIT] User ${fullName} (ID: ${userId}) with ID ${idNumber} submitted documents.`);
    // Update user's KYC status in the database to pending
    await pool.query('UPDATE users SET kyc_status = "pending", full_name = ? WHERE id = ?', [fullName, userId]);
    res.json({ success: true, message: 'KYC submitted successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Create Support Ticket
app.post('/api/tickets', async (req, res) => {
  const { userId, subject, category } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO support_tickets (user_id, subject, category, status) VALUES (?, ?, ?, "open")',
      [userId || 1, subject, category]
    );
    res.json({ success: true, ticketId: `TKT-${result.insertId}`, message: 'Ticket created successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get Support Tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM support_tickets ORDER BY id DESC');
    res.json({ success: true, tickets: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Basic status check
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    platform: 'VeloTrade',
    version: '1.1.0',
    developer: 'Sếp Thiên Ân & Grace',
    databaseConnected: !!pool
  });
});


// Real-time pricing loops for all 21 coins
const activePrices: { [key: string]: number } = {
  BTC: 67500.00,
  ETH: 3500.00,
  USDT: 1.00,
  BNB: 580.00,
  SOL: 145.00,
  XRP: 0.49,
  ADA: 0.38,
  DOGE: 0.12,
  SHIB: 0.000018,
  DOT: 5.80,
  LINK: 15.20,
  AVAX: 32.50,
  MATIC: 0.58,
  NEAR: 5.50,
  UNI: 7.20,
  LTC: 74.00,
  ATOM: 6.20,
  TRX: 0.11,
  FTM: 0.55,
  OP: 1.80,
  ARB: 0.95
};

// WebSocket Event Handling
io.on('connection', (socket) => {
  console.log(`✨ Client connected to WebSockets: ${socket.id} (◕‿◕)★`);

  socket.emit('initial_prices', activePrices);

  socket.on('disconnect', () => {
    console.log(`👋 Client disconnected: ${socket.id}`);
  });
});

// Price fluctuation feed
setInterval(() => {
  const updates: any[] = [];
  
  Object.keys(activePrices).forEach(symbol => {
    if (symbol === 'USDT') return;
    
    const percent = (Math.random() - 0.5) * 0.001;
    activePrices[symbol] += activePrices[symbol] * percent;
    
    const decimals = symbol === 'SHIB' ? 6 : activePrices[symbol] < 1 ? 4 : 2;
    activePrices[symbol] = parseFloat(activePrices[symbol].toFixed(decimals));

    updates.push({
      symbol: `${symbol}_USDT`,
      price: activePrices[symbol],
      timestamp: Date.now()
    });
  });

  io.emit('price_update', updates);
}, 1000);


const PORT = 4000;
httpServer.listen(PORT, async () => {
  await initDatabase();
  console.log(`====================================================`);
  console.log(`🚀 VeloTrade Full-Stack Server v1.1 is running on:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`====================================================`);
});
