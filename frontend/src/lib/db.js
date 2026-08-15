// Database abstraction layer - now uses Express/MongoDB API
import { authApi, transactionsApi, portfolioApi, budgetsApi, loansApi, savingsApi } from './api';

// Store token
const setToken = (token) => {
  if (token) {
    localStorage.setItem('finvest_token', token);
  } else {
    localStorage.removeItem('finvest_token');
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
        return { user: result.user, error: null };
      } catch (err) {
        return { user: null, error: err.message };
      }
    },
    
    signOut: async () => {
      setToken(null);
    },

    updateProfile: async (profileData) => {
      return authApi.updateProfile(profileData);
    },

    resetData: async () => {
      return authApi.resetData();
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