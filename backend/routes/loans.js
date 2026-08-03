import express from 'express';
import Loan from '../models/Loan.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Get all loans
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.userId });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add loan
router.post('/', async (req, res) => {
  try {
    const { name, principal, remaining, rate, tenureMonths, startDate, nextPaymentDate, monthlyEMI } = req.body;
    const loan = new Loan({
      userId: req.userId,
      name,
      principal,
      remaining,
      rate,
      tenureMonths,
      startDate: new Date(startDate),
      nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : null,
      monthlyEMI,
      totalPaid: 0,
      interestPaid: 0
    });
    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pay EMI
router.post('/:id/pay', async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const extraPayment = parseFloat(req.body.extraPayment) || 0;
    const payment = loan.monthlyEMI + extraPayment;
    
    // Calculate interest portion for this payment
    const interestPortion = (loan.remaining * loan.rate / 100) / 12;
    const principalPortion = payment - interestPortion;
    
    loan.remaining = Math.max(0, loan.remaining - principalPortion);
    loan.totalPaid += payment;
    loan.interestPaid += interestPortion;
    
    // Update next payment date (assume monthly)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    loan.nextPaymentDate = loan.remaining > 0 ? nextDate : null;
    
    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete loan
router.delete('/:id', async (req, res) => {
  try {
    await Loan.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;