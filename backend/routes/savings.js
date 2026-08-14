import express from 'express';
import SavingsGoal from '../models/SavingsGoal.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/error.js';

const router = express.Router();

router.use(authenticate);

// Get all savings goals
router.get('/', asyncHandler(async (req, res, next) => {
  const goals = await SavingsGoal.find({ userId: req.userId });
  res.json(goals);
}));

// Add savings goal
router.post('/', asyncHandler(async (req, res, next) => {
  const { name, targetAmount, currentAmount, targetDate, category } = req.body;
  
  if (!name || targetAmount === undefined || !targetDate || !category) {
    return next(new AppError('Please provide all required fields: name, targetAmount, targetDate, category', 400));
  }

  const goal = new SavingsGoal({
    userId: req.userId,
    name,
    targetAmount,
    currentAmount: currentAmount || 0,
    targetDate: new Date(targetDate),
    category
  });
  
  await goal.save();
  res.status(201).json(goal);
}));

// Add savings to goal
router.post('/:id/deposit', asyncHandler(async (req, res, next) => {
  const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId });
  if (!goal) {
    return next(new AppError('Goal not found', 404));
  }

  const amount = parseFloat(req.body.amount);
  if (isNaN(amount) || amount <= 0) {
    return next(new AppError('Please provide a valid deposit amount', 400));
  }

  goal.currentAmount += amount;
  await goal.save();
  res.json(goal);
}));

// Delete savings goal
router.delete('/:id', asyncHandler(async (req, res, next) => {
  const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!goal) {
    return next(new AppError('Goal not found', 404));
  }
  res.json({ success: true });
}));

export default router;