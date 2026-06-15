import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST']
  }
});

// Basic HTTP status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    platform: 'VeloTrade',
    version: '1.0.0',
    developer: 'Sếp Thiên Ân & Grace'
  });
});

// WebSocket Server Event Handling
io.on('connection', (socket) => {
  console.log(`✨ Client connected: ${socket.id} (◕‿◕)★`);

  socket.on('disconnect', () => {
    console.log(`👋 Client disconnected: ${socket.id}`);
  });
});

// Simulated BTC price generator to feed the chart in real-time desu~!
let btcPrice = 67500.00;
setInterval(() => {
  // Random fluctuation between -50 and +50 USD
  const fluctuation = (Math.random() - 0.5) * 100;
  btcPrice += fluctuation;
  btcPrice = parseFloat(btcPrice.toFixed(2));

  // Emit the price to all connected clients
  io.emit('price_update', {
    symbol: 'BTC_USDT',
    price: btcPrice,
    timestamp: Date.now()
  });
  
  // Also log to console so Sếp can see it running
  console.log(`[REAL-TIME] 🪙 BTC/USDT Price: $${btcPrice}`);
}, 1000);

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 VeloTrade Server is running beautifully on:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`====================================================`);
});
