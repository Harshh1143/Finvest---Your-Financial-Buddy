import express from 'express';
import { Budget, CategoryBudget } from '../models/Budget.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/error.js';

const router = express.Router();

router.use(authenticate);

// Get user's budget
router.get('/', asyncHandler(async (req, res, next) => {
  const budget = await Budget.findOne({ userId: req.userId });
  res.json(budget);
}));

// Set/update budget
router.post('/', asyncHandler(async (req, res, next) => {
  const { monthlyBudget } = req.body;
  
  if (monthlyBudget === undefined || monthlyBudget < 0) {
    return next(new AppError('Please provide a valid monthly budget amount', 400));
  }

  let budget = await Budget.findOne({ userId: req.userId });
  
  if (budget) {
    budget.monthlyBudget = monthlyBudget;
    await budget.save();
  } else {
    budget = new Budget({ userId: req.userId, monthlyBudget });
    await budget.save();
  }
  res.json(budget);
}));

// Get category budgets
router.get('/categories', asyncHandler(async (req, res, next) => {
  const budgets = await CategoryBudget.find({ userId: req.userId });
  res.json(budgets);
}));

// Set category budget
router.post('/categories', asyncHandler(async (req, res, next) => {
  const { category, monthlyBudget } = req.body;
  
  if (!category) {
    return next(new AppError('Category is required', 400));
  }
  if (monthlyBudget === undefined || monthlyBudget < 0) {
    return next(new AppError('Please provide a valid monthly budget amount', 400));
  }

  let budget = await CategoryBudget.findOne({ userId: req.userId, category });
  
  if (budget) {
    budget.monthlyBudget = monthlyBudget;
    await budget.save();
  } else {
    budget = new CategoryBudget({ userId: req.userId, category, monthlyBudget });
    await budget.save();
  }
  res.json(budget);
}));

// Delete category budget
router.delete('/categories/:category', asyncHandler(async (req, res, next) => {
  const deletedBudget = await CategoryBudget.findOneAndDelete({ 
    userId: req.userId, 
    category: req.params.category 
  });
  
  if (!deletedBudget) {
    return next(new AppError('Category budget not found', 404));
  }
  
  res.json({ success: true });
}));

export default router;