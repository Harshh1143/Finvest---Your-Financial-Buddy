import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import portfolioRoutes from './routes/portfolio.js';
import budgetRoutes from './routes/budgets.js';
import loanRoutes from './routes/loans.js';
import savingsRoutes from './routes/savings.js';
import { errorHandler, AppError } from './middleware/error.js';
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
// Handle uncaught exceptions before any other execution
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finvest';

// Fallback to local MongoDB if Atlas connection string contains placeholders
if (MONGODB_URI.includes('<username>') || MONGODB_URI.includes('<password>') || MONGODB_URI.includes('<cluster-url>')) {
  console.warn('⚠️ MongoDB Atlas placeholders detected in MONGODB_URI. Falling back to local MongoDB.');
  MONGODB_URI = 'mongodb://localhost:27017/finvest';
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/savings', savingsRoutes);

// Health check
app.get(['/health', '/api/health'], (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'up' : 'down';
  
  if (dbState !== 1) {
    return res.status(503).json({
      status: 'error',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Fallback for unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized error handling middleware (must be registered last)
app.use(errorHandler);

let server;

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});