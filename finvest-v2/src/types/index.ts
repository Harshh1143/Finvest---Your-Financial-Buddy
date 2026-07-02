export interface Profile {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category: string;
  description: string;
  created_at: string;
}

export interface PortfolioAsset {
  id: number;
  user_id: string;
  name: string;
  symbol: string;
  asset_type: "Stocks" | "Bonds" | "Cryptocurrency" | "Real Estate" | "Gold & Precious Metals" | "Cash & Savings" | "Vehicle" | "Other";
  current_price: number;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  total_value: number;
  total_cost: number;
  unrealized_pl: number;
  unrealized_pl_percent: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioHistory {
  id: number;
  user_id: string;
  asset_id: number;
  price: number;
  date_recorded: string;
}

export interface Budget {
  id: number;
  user_id: string;
  monthly_budget: number;
  created_at: string;
}

export interface CategoryBudget {
  id: number;
  user_id: string;
  category: string;
  monthly_budget: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  budget: number;
  exclude_from_main_budget: boolean;
  created_at: string;
}

export interface EventTransaction {
  id: number;
  user_id: string;
  event_id: number;
  amount: number;
  type: "income" | "expense";
  date: string;
  category: string;
  description: string;
  created_at: string;
}

export interface Loan {
  id: number;
  user_id: string;
  name: string;
  principal: number;
  remaining: number;
  rate: number;
  tenure_months: number;
  start_date: string;
  next_payment_date: string | null;
  monthly_emi: number;
  total_paid: number;
  interest_paid: number;
  created_at: string;
}

export interface SavingsGoal {
  id: number;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_transactions: number;
  total_volume: number;
  total_assets: number;
}
