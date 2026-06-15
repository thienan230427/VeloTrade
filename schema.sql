-- ==========================================
-- 🪙 VELOTRADE COMMERCIAL CRYPTO PLATFORM SCHEMA
-- Fully-featured Multi-tier Database (MySQL 8.0+)
-- Designed by Thiên Ân
-- Supporting: Admin Portal, Client Portal, and 20+ Hot Coin Pages
-- ==========================================

CREATE DATABASE IF NOT EXISTS velo_trade CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE velo_trade;

-- Disable foreign key checks temporarily to drop if exists safely
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS matched_trades;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS deposits_withdrawals;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS coin_news;
DROP TABLE IF EXISTS coin_price_history;
DROP TABLE IF EXISTS markets;
DROP TABLE IF EXISTS coins;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- SECTION 1: USER MANAGEMENT (ADMINS & CUSTOMERS)
-- ========================================================

-- Users Table (Dual Role: Customers & Administrators)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('customer', 'admin', 'moderator') DEFAULT 'customer',
    kyc_status ENUM('unverified', 'pending', 'verified', 'rejected') DEFAULT 'unverified',
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    two_factor_secret VARCHAR(100) DEFAULT NULL,
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB;

-- Audit Logs (Specifically for Admin actions and security auditing)
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255) NOT NULL, -- e.g., 'SUSPEND_USER', 'APPROVE_WITHDRAWAL', 'UPDATE_FEE'
    target_table VARCHAR(100) DEFAULT NULL,
    target_id INT DEFAULT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    payload JSON DEFAULT NULL, -- Old vs new values
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ========================================================
-- SECTION 2: COIN CMS & METADATA (20+ HOT COIN PAGES)
-- ========================================================

-- Coins Table (Stores SEO descriptions, categories, and technical metadata for 20+ hot coins)
CREATE TABLE coins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(15) NOT NULL UNIQUE, -- BTC, ETH, SOL...
    name VARCHAR(100) NOT NULL,        -- Bitcoin, Ethereum, Solana...
    category ENUM('layer1', 'layer2', 'defi', 'meme', 'web3', 'ai_depin', 'stablecoin') NOT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
    description TEXT NOT NULL,         -- Markdown detailed coin info for the specific page
    website_url VARCHAR(255) DEFAULT NULL,
    whitepaper_url VARCHAR(255) DEFAULT NULL,
    circulating_supply DECIMAL(36, 6) DEFAULT 0.000000,
    max_supply DECIMAL(36, 6) DEFAULT NULL, -- Null represents infinite supply (e.g., ETH)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coin_symbol (symbol),
    INDEX idx_coin_category (category)
) ENGINE=InnoDB;

-- Coin Price History / Candlestick Data (For rendering charts on each coin's page)
CREATE TABLE coin_price_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coin_id INT NOT NULL,
    timeframe ENUM('1m', '5m', '15m', '1h', '4h', '1d') NOT NULL,
    open_price DECIMAL(36, 18) NOT NULL,
    high_price DECIMAL(36, 18) NOT NULL,
    low_price DECIMAL(36, 18) NOT NULL,
    close_price DECIMAL(36, 18) NOT NULL,
    volume DECIMAL(36, 18) NOT NULL,
    timestamp BIGINT NOT NULL, -- Unix epoch timestamp
    FOREIGN KEY (coin_id) REFERENCES coins(id) ON DELETE CASCADE,
    UNIQUE KEY uq_coin_timeframe_time (coin_id, timeframe, timestamp)
) ENGINE=InnoDB;

-- News & Updates tied to specific Coins (To enrich the 20+ hot coin pages)
CREATE TABLE coin_news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coin_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source_name VARCHAR(100) DEFAULT 'VeloTrade Editorial',
    image_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coin_id) REFERENCES coins(id) ON DELETE CASCADE,
    INDEX idx_news_coin (coin_id)
) ENGINE=InnoDB;


-- ========================================================
-- SECTION 3: CORE FINANCIALS (MARKETS & WALLETS)
-- ========================================================

-- Markets / Trading Pairs Table (e.g. BTC/USDT, ETH/USDT)
CREATE TABLE markets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    base_coin_id INT NOT NULL,  -- e.g., BTC (coin id)
    quote_coin_id INT NOT NULL, -- e.g., USDT (coin id)
    symbol VARCHAR(30) NOT NULL UNIQUE, -- e.g., 'BTC_USDT'
    min_order_size DECIMAL(36, 18) DEFAULT 0.000010000000000000,
    max_order_size DECIMAL(36, 18) DEFAULT 1000000.000000000000000000,
    maker_fee_percent DECIMAL(5, 4) DEFAULT 0.0010, -- 0.1% maker fee
    taker_fee_percent DECIMAL(5, 4) DEFAULT 0.0015, -- 0.15% taker fee
    is_trading_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (base_coin_id) REFERENCES coins(id) ON DELETE RESTRICT,
    FOREIGN KEY (quote_coin_id) REFERENCES coins(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Wallets / Balances Table
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coin_id INT NOT NULL,
    balance DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    locked_balance DECIMAL(36, 18) DEFAULT 0.000000000000000000, -- Amount frozen in open orders
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_coin (user_id, coin_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coin_id) REFERENCES coins(id) ON DELETE RESTRICT,
    INDEX idx_wallet_user (user_id)
) ENGINE=InnoDB;

-- Deposits and Withdrawals Ledger (With Admin review integration)
CREATE TABLE deposits_withdrawals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,
    type ENUM('deposit', 'withdrawal') NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    fee DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    address VARCHAR(255) NOT NULL, -- Blockchain target or receiving address
    tx_hash VARCHAR(255) DEFAULT NULL, -- External txn id
    status ENUM('pending', 'processing', 'completed', 'failed', 'rejected') DEFAULT 'pending',
    approved_by_admin_id INT DEFAULT NULL, -- Link to admin who processed this
    processed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_fin_ledger_user (user_id),
    INDEX idx_fin_ledger_status (status)
) ENGINE=InnoDB;


-- ========================================================
-- SECTION 4: TRADING ENGINE & ORDER BOOK
-- ========================================================

-- Orders Table (Supports Limit/Market and Buy/Sell)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    market_id INT NOT NULL,
    side ENUM('buy', 'sell') NOT NULL,
    type ENUM('limit', 'market') NOT NULL,
    price DECIMAL(36, 18) NOT NULL, -- For limit orders
    quantity DECIMAL(36, 18) NOT NULL,
    filled_quantity DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    status ENUM('pending', 'partially_filled', 'filled', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE,
    INDEX idx_order_user (user_id),
    INDEX idx_order_market_status (market_id, status)
) ENGINE=InnoDB;

-- Matched Trades Table (Receipts of transactions between buyer and seller)
CREATE TABLE matched_trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    market_id INT NOT NULL,
    maker_order_id INT NOT NULL,
    taker_order_id INT NOT NULL,
    price DECIMAL(36, 18) NOT NULL,
    quantity DECIMAL(36, 18) NOT NULL,
    maker_fee DECIMAL(36, 18) NOT NULL,
    taker_fee DECIMAL(36, 18) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE,
    FOREIGN KEY (maker_order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (taker_order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_trades_market (market_id)
) ENGINE=InnoDB;


-- ========================================================
-- SECTION 5: CUSTOMER SUPPORT & SETTINGS (ADMIN INTERACTION)
-- ========================================================

-- Support Tickets (For customers to communicate with administrators)
CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., 'DEPOSIT', 'TRADING', 'KYC'
    status ENUM('open', 'assigned', 'resolved', 'closed') DEFAULT 'open',
    assigned_admin_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tickets_status (status)
) ENGINE=InnoDB;

-- Global System Settings (Controlled via Admin Panel)
CREATE TABLE site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    `value` TEXT NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- ========================================================
-- SECTION 6: INITIAL DATA SEEDING (20+ COINS SEED DATA)
-- ========================================================

INSERT INTO coins (symbol, name, category, logo_url, description, circulating_supply, max_supply) VALUES
('BTC', 'Bitcoin', 'layer1', 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', 'Vua của tiền số, giải pháp lưu trữ tài sản phi tập trung mạng ngang hàng.', 19700000.0, 21000000.0),
('ETH', 'Ethereum', 'layer1', 'https://cryptologos.cc/logos/ethereum-eth-logo.png', 'Nền tảng hợp đồng thông minh đầu tiên, trái tim của DeFi toàn cầu.', 122000000.0, NULL),
('USDT', 'Tether', 'stablecoin', 'https://cryptologos.cc/logos/tether-usdt-logo.png', 'Đồng ổn định giá (Stablecoin) lớn nhất thế giới, neo theo đô la Mỹ USD.', 112000000000.0, NULL),
('BNB', 'Binance Coin', 'layer1', 'https://cryptologos.cc/logos/bnb-bnb-logo.png', 'Đồng coin chính thức của hệ sinh thái Binance và mạng BNB Chain.', 147500000.0, 200000000.0),
('SOL', 'Solana', 'layer1', 'https://cryptologos.cc/logos/solana-sol-logo.png', 'Blockchain Layer 1 hiệu năng cực cao, tốc độ xử lý nhanh, phí rẻ như cho.', 461000000.0, NULL),
('XRP', 'Ripple', 'layer1', 'https://cryptologos.cc/logos/xrp-xrp-logo.png', 'Giải pháp thanh toán liên biên giới siêu tốc dành cho các ngân hàng truyền thống.', 55000000000.0, 100000000000.0),
('ADA', 'Cardano', 'layer1', 'https://cryptologos.cc/logos/cardano-ada-logo.png', 'Dự án blockchain mã nguồn mở dựa trên nghiên cứu khoa học học thuật khắt khe.', 35600000000.0, 45000000000.0),
('DOGE', 'Dogecoin', 'meme', 'https://cryptologos.cc/logos/dogecoin-doge-logo.png', 'Vua của thế giới meme-coin, được hậu thuẫn cực mạnh bởi Elon Musk.', 144000000000.0, NULL),
('SHIB', 'Shiba Inu', 'meme', 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png', 'Đồng coin lấy cảm hứng từ chó Shiba, nay đã phát triển hệ sinh thái DeFi riêng.', 589000000000000.0, NULL),
('DOT', 'Polkadot', 'layer1', 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png', 'Mạng lưới đa chuỗi (Multi-chain) giúp kết nối các blockchain riêng lẻ lại với nhau.', 1430000000.0, NULL),
('LINK', 'Chainlink', 'defi', 'https://cryptologos.cc/logos/chainlink-link-logo.png', 'Mạng lưới Oracle phi tập trung cung cấp dữ liệu thực tế cho hợp đồng thông minh.', 587000000.0, 1000000000.0),
('AVAX', 'Avalanche', 'layer1', 'https://cryptologos.cc/logos/avalanche-avax-logo.png', 'Nền tảng hợp đồng thông minh có tốc độ hoàn thành giao dịch (finality) siêu nhanh.', 392000000.0, 720000000.0),
('MATIC', 'Polygon', 'layer2', 'https://cryptologos.cc/logos/polygon-matic-logo.png', 'Giải pháp mở rộng quy mô Layer 2 hàng đầu cho mạng lưới Ethereum.', 9900000000.0, 10000000000.0),
('NEAR', 'Near Protocol', 'layer1', 'https://cryptologos.cc/logos/near-protocol-near-logo.png', 'Blockchain thân thiện với lập trình viên nhờ cơ chế phân mảnh Sharding.', 1080000000.0, 1000000000.0),
('UNI', 'Uniswap', 'defi', 'https://cryptologos.cc/logos/uniswap-uni-logo.png', 'Đồng quản trị của sàn giao dịch phi tập trung (DEX) lớn nhất trên Ethereum.', 600000000.0, 1000000000.0),
('LTC', 'Litecoin', 'layer1', 'https://cryptologos.cc/logos/litecoin-ltc-logo.png', 'Được coi là bạc kỹ thuật số (bên cạnh vàng BTC), giao dịch nhanh và phí rẻ.', 74000000.0, 84000000.0),
('ATOM', 'Cosmos', 'layer1', 'https://cryptologos.cc/logos/cosmos-atom-logo.png', 'Mạng lưới Internet của các Blockchain thông qua giao thức truyền thông IBC.', 390000000.0, NULL),
('TRX', 'Tron', 'layer1', 'https://cryptologos.cc/logos/tron-trx-logo.png', 'Hệ sinh thái giải trí và mạng blockchain có khối lượng giao dịch USDT khổng lồ.', 87000000000.0, NULL),
('FTM', 'Fantom', 'layer1', 'https://cryptologos.cc/logos/fantom-ftm-logo.png', 'Mạng lưới blockchain sử dụng cấu trúc đồ thị có hướng không chu trình (DAG).', 2800000000.0, 3175000000.0),
('OP', 'Optimism', 'layer2', 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png', 'Giải pháp Layer 2 Rollup phát triển siêu tốc giúp tối ưu hóa chi phí Ethereum.', 1080000000.0, 4294967296.0),
('ARB', 'Arbitrum', 'layer2', 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', 'Layer 2 Rollup có TVL (Tổng tài sản bị khóa) lớn nhất hệ sinh thái Ethereum.', 2900000000.0, 10000000000.0);

-- Populate global settings
INSERT INTO site_settings (`key`, `value`, `description`) VALUES
('maintenance_mode', 'false', 'Kích hoạt chế độ bảo trì toàn trang web (true/false)'),
('trading_fee_reduction_promo', '0.0', 'Phần trăm giảm phí giao dịch khuyến mại (ví dụ: 0.1 cho 10%)'),
('min_withdrawal_limit_usdt', '10.0', 'Hạn mức rút tiền tối thiểu cho đồng USDT');
