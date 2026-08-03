// API client for the Express/MongoDB backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('finvest_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
};

// Auth API
export const authApi = {
  login: (email, password) => 
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  
  register: (name, email, password) => 
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  
  me: () => request('/auth/me'),
};

// Transactions API
export const transactionsApi = {
  list: () => request('/transactions'),
  add: (transaction) => request('/transactions', { method: 'POST', body: JSON.stringify(transaction) }),
  delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
};

// Portfolio API
export const portfolioApi = {
  list: () => request('/portfolio'),
  add: (asset) => request('/portfolio', { method: 'POST', body: JSON.stringify(asset) }),
  delete: (id) => request(`/portfolio/${id}`, { method: 'DELETE' }),
  updatePrice: (id, currentPrice) => 
    request(`/portfolio/${id}/price`, { method: 'PATCH', body: JSON.stringify({ currentPrice }) }),
};

// Budgets API
export const budgetsApi = {
  get: () => request('/budgets'),
  set: (monthlyBudget) => request('/budgets', { method: 'POST', body: JSON.stringify({ monthlyBudget }) }),
  listCategories: () => request('/budgets/categories'),
  setCategory: (category, monthlyBudget) => 
    request('/budgets/categories', { method: 'POST', body: JSON.stringify({ category, monthlyBudget }) }),
  deleteCategory: (category) => request(`/budgets/categories/${category}`, { method: 'DELETE' }),
};

// Loans API
export const loansApi = {
  list: () => request('/loans'),
  add: (loan) => request('/loans', { method: 'POST', body: JSON.stringify(loan) }),
  payEMI: (id, extraPayment) => 
    request(`/loans/${id}/pay`, { method: 'POST', body: JSON.stringify({ extraPayment }) }),
  delete: (id) => request(`/loans/${id}`, { method: 'DELETE' }),
};

// Savings API
export const savingsApi = {
  list: () => request('/savings'),
  add: (goal) => request('/savings', { method: 'POST', body: JSON.stringify(goal) }),
  addDeposit: (id, amount) => 
    request(`/savings/${id}/deposit`, { method: 'POST', body: JSON.stringify({ amount }) }),
  delete: (id) => request(`/savings/${id}`, { method: 'DELETE' }),
};