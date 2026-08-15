import express from 'express';
import User from '../models/User.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/error.js';

const router = express.Router();

// Register
router.post('/register', asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email and password', 400));
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  const user = new User({ name, email, password });
  await user.save();

  const token = generateToken(user._id);
  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      settings: user.settings
    },
    token
  });
}));

// Login
router.post('/login', asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = generateToken(user._id);
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      settings: user.settings
    },
    token
  });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    isAdmin: req.user.isAdmin,
    settings: req.user.settings
  });
}));

// Update profile and settings
router.put('/profile', authenticate, asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const { name, email, password, settings } = req.body;

  if (name) user.name = name;
  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new AppError('Email already in use', 400));
    }
    user.email = email.toLowerCase();
  }
  if (password) {
    user.password = password;
  }

  if (settings) {
    user.settings = {
      ...user.settings,
      ...settings
    };
  }

  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      settings: user.settings
    }
  });
}));

// Reset all user data
router.post('/reset-data', authenticate, asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  
  const Transaction = (await import('../models/Transaction.js')).default;
  const PortfolioAsset = (await import('../models/PortfolioAsset.js')).default;
  const Budget = (await import('../models/Budget.js')).default;
  const Loan = (await import('../models/Loan.js')).default;
  const SavingsGoal = (await import('../models/SavingsGoal.js')).default;

  await Transaction.deleteMany({ userId });
  await PortfolioAsset.deleteMany({ userId });
  await Budget.deleteMany({ userId });
  await Loan.deleteMany({ userId });
  await SavingsGoal.deleteMany({ userId });

  res.json({ message: 'All financial data has been reset successfully.' });
}));

export default router;