import axios from 'axios';

// API client for the Express/MongoDB backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('finvest_token');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const request = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers = {} } = options;
  try {
    const response = await api({
      url: endpoint,
      method,
      data: body ? (typeof body === 'string' ? JSON.parse(body) : body) : undefined,
      headers,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Request failed';
    throw new Error(errorMessage);
  }
};


// Auth API
export const authApi = {
  login: (email, password) => 
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  
  register: (name, email, password) => 
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  
  me: () => request('/auth/me'),

  updateProfile: (profileData) => 
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  resetData: () => 
    request('/auth/reset-data', { method: 'POST' }),
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