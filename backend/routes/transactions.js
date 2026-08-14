import express from 'express';
import Transaction from '../models/Transaction.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/error.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all transactions for user
router.get('/', asyncHandler(async (req, res, next) => {
  const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
  res.json(transactions);
}));

// Add transaction
router.post('/', asyncHandler(async (req, res, next) => {
  const { amount, type, date, category, description } = req.body;
  
  if (amount === undefined || !type || !date || !category || !description) {
    return next(new AppError('Please provide all required fields: amount, type, date, category, description', 400));
  }

  const transaction = new Transaction({
    userId: req.userId,
    amount,
    type,
    date: new Date(date),
    category,
    description
  });
  
  await transaction.save();
  res.status(201).json(transaction);
}));

// Delete transaction
router.delete('/:id', asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }
  res.json({ success: true });
}));

export default router;