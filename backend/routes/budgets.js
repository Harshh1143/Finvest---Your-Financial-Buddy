import express from 'express';
import { Budget, CategoryBudget } from '../models/Budget.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Get user's budget
router.get('/', async (req, res) => {
  try {
    const budget = await Budget.findOne({ userId: req.userId });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set/update budget
router.post('/', async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    let budget = await Budget.findOne({ userId: req.userId });
    
    if (budget) {
      budget.monthlyBudget = monthlyBudget;
      await budget.save();
    } else {
      budget = new Budget({ userId: req.userId, monthlyBudget });
      await budget.save();
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category budgets
router.get('/categories', async (req, res) => {
  try {
    const budgets = await CategoryBudget.find({ userId: req.userId });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set category budget
router.post('/categories', async (req, res) => {
  try {
    const { category, monthlyBudget } = req.body;
    let budget = await CategoryBudget.findOne({ userId: req.userId, category });
    
    if (budget) {
      budget.monthlyBudget = monthlyBudget;
      await budget.save();
    } else {
      budget = new CategoryBudget({ userId: req.userId, category, monthlyBudget });
      await budget.save();
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category budget
router.delete('/categories/:category', async (req, res) => {
  try {
    await CategoryBudget.findOneAndDelete({ 
      userId: req.userId, 
      category: req.params.category 
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;