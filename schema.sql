-- ==========================================
-- 🪙 VELOTRADE CRYPTO EXCHANGE DATABASE SCHEMA
-- Designed with 💖 by Grace for Sếp Thiên Ân
-- Target: MySQL 8.0+ / Port: 3306
-- ==========================================

CREATE DATABASE IF NOT EXISTS velo_trade CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE velo_trade;

-- 1. USERS TABLE
-- Stores user registration, credentials, and verification status
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    kyc_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. WALLETS TABLE
-- Manages asset balances for each user (e.g., BTC, ETH, USDT)
-- Designed to prevent double-spending with decimal precision (18 decimal places)
CREATE TABLE IF NOT EXISTS wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    asset_symbol VARCHAR(10) NOT NULL, -- 'BTC', 'ETH', 'USDT'
    balance DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    locked_balance DECIMAL(36, 18) DEFAULT 0.000000000000000000, -- Held in active orders
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_asset (user_id, asset_symbol),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. ORDERS TABLE
-- Tracks limit/market buy and sell orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    market VARCHAR(20) NOT NULL, -- e.g., 'BTC_USDT', 'ETH_USDT'
    side ENUM('buy', 'sell') NOT NULL,
    type ENUM('limit', 'market') NOT NULL,
    price DECIMAL(36, 18) NOT NULL,
    quantity DECIMAL(36, 18) NOT NULL,
    filled_quantity DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    status ENUM('pending', 'partially_filled', 'filled', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. TRANSACTIONS TABLE
-- Logs ledger entries for any balance modifications (deposits, withdrawals, trades)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,
    type ENUM('deposit', 'withdrawal', 'trade_buy', 'trade_sell') NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    fee DECIMAL(36, 18) DEFAULT 0.000000000000000000,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    tx_hash VARCHAR(100) DEFAULT NULL, -- External blockchain tx hash if deposit/withdrawal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. MATCHED_TRADES TABLE
-- Records successful matches executed by the matching engine
CREATE TABLE IF NOT EXISTS matched_trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    market VARCHAR(20) NOT NULL,
    maker_order_id INT NOT NULL,
    taker_order_id INT NOT NULL,
    price DECIMAL(36, 18) NOT NULL,
    quantity DECIMAL(36, 18) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maker_order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (taker_order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexing for maximum query speed
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_market_status ON orders(market, status);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_matched_trades_market ON matched_trades(market);
