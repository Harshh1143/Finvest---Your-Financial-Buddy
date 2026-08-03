// Database abstraction layer - now uses Express/MongoDB API
import { authApi, transactionsApi, portfolioApi, budgetsApi, loansApi, savingsApi } from './api';

// Seed data for new users
const SEED_TRANSACTIONS = [
  { amount: 5000, type: 'income', date: new Date().toISOString().split('T')[0], category: 'Salary', description: 'Monthly Core Technology Salary' },
  { amount: 1500, type: 'expense', date: new Date().toISOString().split('T')[0], category: 'Housing', description: 'Luxury Apartment Rent Payment' },
  { amount: 125.50, type: 'expense', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Food', description: 'Whole Foods Organic Groceries' },
  { amount: 89.90, type: 'expense', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Utilities', description: 'High-Speed Fiber Internet & Electricity' },
  { amount: 45.00, type: 'expense', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Travel', description: 'Uber ride to airport' },
  { amount: 320.00, type: 'expense', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Shopping', description: 'Ergonomic Office Desk Chair' },
  { amount: 180.00, type: 'expense', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Food', description: 'Vessel Sushi Bar Dinner' },
  { amount: 15.00, type: 'expense', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Entertainment', description: 'Spotify Premium Annual Sub' },
  { amount: 5000, type: 'income', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Salary', description: 'Previous Month Core Salary' },
  { amount: 1500, type: 'expense', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], category: 'Housing', description: 'Apartment Rent Payment (Previous)' }
];

const SEED_PORTFOLIO = [
  { name: 'Apple Inc.', symbol: 'AAPL', assetType: 'Stocks', currentPrice: 214.83, quantity: 12, purchasePrice: 198.40, purchaseDate: '2024-01-16' },
  { name: 'Bitcoin', symbol: 'BTC', assetType: 'Cryptocurrency', currentPrice: 64250.00, quantity: 0.45, purchasePrice: 43500.00, purchaseDate: '2023-11-05' },
  { name: 'Vanguard 10-Yr US Treasury Bond', symbol: 'BND', assetType: 'Bonds', currentPrice: 74.35, quantity: 150, purchasePrice: 72.00, purchaseDate: '2024-03-10' }
];

const SEED_BUDGET = 4500;

const SEED_LOANS = [
  { name: 'Home Loan', principal: 320000, remaining: 248000, rate: 6.5, tenureMonths: 360, startDate: '2020-01-15', nextPaymentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], monthlyEMI: 2022.62 },
  { name: 'Graduate Student Loan', principal: 64000, remaining: 41200, rate: 5.2, tenureMonths: 120, startDate: '2022-09-01', nextPaymentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], monthlyEMI: 684.50 }
];

const SEED_SAVINGS_GOALS = [
  { name: 'Emergency Fund', targetAmount: 30000, currentAmount: 22800, targetDate: '2027-01-01', category: 'Savings' },
  { name: 'Tesla Model S Deposit', targetAmount: 15000, currentAmount: 6000, targetDate: '2026-12-15', category: 'Goal' }
];

// Store token
const setToken = (token) => {
  if (token) {
    localStorage.setItem('finvest_token', token);
  } else {
    localStorage.removeItem('finvest_token');
  }
};

// Seed data for new user
const seedUserData = async () => {
  try {
    // Seed transactions
    for (const tx of SEED_TRANSACTIONS) {
      await transactionsApi.add(tx);
    }
    // Seed portfolio
    for (const asset of SEED_PORTFOLIO) {
      await portfolioApi.add(asset);
    }
    // Seed budget
    await budgetsApi.set(SEED_BUDGET);
    // Seed loans
    for (const loan of SEED_LOANS) {
      await loansApi.add(loan);
    }
    // Seed savings goals
    for (const goal of SEED_SAVINGS_GOALS) {
      await savingsApi.add(goal);
    }
  } catch (err) {
    console.error('Failed to seed user data:', err);
  }
};

// Unified Database Client - matches original API
export const db = {
  auth: {
    getCurrentUser: async () => {
      try {
        const user = await authApi.me();
        return user;
      } catch {
        return null;
      }
    },
    
    signIn: async (email, password) => {
      try {
        const result = await authApi.login(email, password);
        setToken(result.token);
        return { user: result.user, error: null };
      } catch (err) {
        return { user: null, error: err.message };
      }
    },
    
    signUp: async (name, email, password) => {
      try {
        const result = await authApi.register(name, email, password);
        setToken(result.token);
        // Seed initial data for new users
        await seedUserData();
        return { user: result.user, error: null };
      } catch (err) {
        return { user: null, error: err.message };
      }
    },
    
    signOut: async () => {
      setToken(null);
    }
  },

  transactions: {
    list: async (userId) => transactionsApi.list(),
    add: async (userId, tx) => transactionsApi.add(tx),
    delete: async (userId, txId) => transactionsApi.delete(txId)
  },

  portfolio: {
    list: async (userId) => portfolioApi.list(),
    add: async (userId, asset) => portfolioApi.add(asset),
    delete: async (userId, assetId) => portfolioApi.delete(assetId),
    updatePrice: async (userId, assetId, currentPrice) => portfolioApi.updatePrice(assetId, currentPrice)
  },

  budgets: {
    get: async (userId) => budgetsApi.get(),
    set: async (userId, monthlyBudget) => budgetsApi.set(monthlyBudget),
    listCategoryBudgets: async (userId) => budgetsApi.listCategories(),
    setCategoryBudget: async (userId, category, monthlyBudget) => budgetsApi.setCategory(category, monthlyBudget),
    deleteCategoryBudget: async (userId, category) => budgetsApi.deleteCategory(category)
  },

  loans: {
    list: async (userId) => loansApi.list(),
    add: async (userId, loan) => loansApi.add(loan),
    payEMI: async (userId, loanId, extraPayment) => loansApi.payEMI(loanId, extraPayment),
    delete: async (userId, loanId) => loansApi.delete(loanId)
  },

  savings: {
    list: async (userId) => savingsApi.list(),
    add: async (userId, goal) => savingsApi.add(goal),
    addSavings: async (userId, goalId, amount) => savingsApi.addDeposit(goalId, amount),
    delete: async (userId, goalId) => savingsApi.delete(goalId)
  }
};