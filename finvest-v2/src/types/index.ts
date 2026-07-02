export type NavigationItem = {
  label: string;
  href: string;
  icon: string;
};

export type MetricCard = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  detail: string;
};

export type Transaction = {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
};

export type Goal = {
  id: number;
  title: string;
  target: number;
  current: number;
  deadline: string;
};

export type Loan = {
  id: number;
  name: string;
  type: string;
  principal: number;
  rate: number;
  remaining: number;
  nextPayment: string;
  totalPaid: number;
  interestPaid: number;
};
