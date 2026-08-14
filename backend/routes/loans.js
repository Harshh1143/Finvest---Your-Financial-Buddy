import express from 'express';
import Loan from '../models/Loan.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/error.js';

const router = express.Router();

router.use(authenticate);

// Get all loans
router.get('/', asyncHandler(async (req, res, next) => {
  const loans = await Loan.find({ userId: req.userId });
  res.json(loans);
}));

// Add loan
router.post('/', asyncHandler(async (req, res, next) => {
  const { name, principal, remaining, rate, tenureMonths, startDate, nextPaymentDate, monthlyEMI } = req.body;
  
  if (!name || principal === undefined || rate === undefined || tenureMonths === undefined || !startDate || monthlyEMI === undefined) {
    return next(new AppError('Please provide all required fields: name, principal, rate, tenureMonths, startDate, monthlyEMI', 400));
  }

  const loan = new Loan({
    userId: req.userId,
    name,
    principal,
    remaining: remaining !== undefined ? remaining : principal,
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
}));

// Pay EMI
router.post('/:id/pay', asyncHandler(async (req, res, next) => {
  const loan = await Loan.findOne({ _id: req.params.id, userId: req.userId });
  if (!loan) {
    return next(new AppError('Loan not found', 404));
  }

  const extraPayment = parseFloat(req.body.extraPayment) || 0;
  if (extraPayment < 0) {
    return next(new AppError('Extra payment must be positive', 400));
  }

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
}));

// Delete loan
router.delete('/:id', asyncHandler(async (req, res, next) => {
  const loan = await Loan.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!loan) {
    return next(new AppError('Loan not found', 404));
  }
  res.json({ success: true });
}));

export default router;