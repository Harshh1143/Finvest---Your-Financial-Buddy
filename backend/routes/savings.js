import express from 'express';
import SavingsGoal from '../models/SavingsGoal.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Get all savings goals
router.get('/', async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add savings goal
router.post('/', async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, category } = req.body;
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add savings to goal
router.post('/:id/deposit', async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.currentAmount += parseFloat(req.body.amount) || 0;
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete savings goal
router.delete('/:id', async (req, res) => {
  try {
    await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;