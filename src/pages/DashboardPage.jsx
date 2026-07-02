import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  PiggyBank, Plus, ArrowUpRight, ArrowDownRight, Trash2, Edit3, Check, X,
  Home, Utensils, Zap, ShoppingBag, Plane, Play, Coins, TrendingUp, Landmark, HelpCircle, Activity
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Shell } from "../components/layout/shell";
import { db } from "../lib/db";
import { useAuth } from "../components/providers/auth-provider";
import { AddTransactionModal } from "../components/modals/AddTransactionModal";
import { AddSavingsGoalModal } from "../components/modals/AddSavingsGoalModal";
import { toast } from "sonner";

const COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#f59e0b", "#ec4899", "#10b981"];

const getCategoryIcon = (category) => {
  const c = category.toLowerCase();
  if (c.includes("housing") || c.includes("rent")) return Home;
  if (c.includes("food") || c.includes("dining") || c.includes("groceries") || c.includes("restaurant")) return Utensils;
  if (c.includes("utilities") || c.includes("bills") || c.includes("electricity") || c.includes("water")) return Zap;
  if (c.includes("shopping") || c.includes("apparel") || c.includes("store")) return ShoppingBag;
  if (c.includes("travel") || c.includes("commute") || c.includes("transport") || c.includes("flight")) return Plane;
  if (c.includes("entertainment") || c.includes("leisure") || c.includes("fun") || c.includes("movie")) return Play;
  if (c.includes("investment") || c.includes("stocks") || c.includes("portfolio") || c.includes("shares")) return TrendingUp;
  if (c.includes("salary") || c.includes("income") || c.includes("paycheck")) return ArrowUpRight;
  return Coins;
};

const getCategoryColor = (category) => {
  const c = category.toLowerCase();
  if (c.includes("housing") || c.includes("rent")) return "text-violet-400 bg-violet-500/10 border-violet-500/20";
  if (c.includes("food") || c.includes("dining") || c.includes("groceries")) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  if (c.includes("utilities") || c.includes("bills")) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
  if (c.includes("shopping")) return "text-pink-400 bg-pink-500/10 border-pink-500/20";
  if (c.includes("travel") || c.includes("commute")) return "text-sky-400 bg-sky-500/10 border-sky-500/20";
  if (c.includes("entertainment")) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  if (c.includes("investment") || c.includes("stocks")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (c.includes("salary") || c.includes("income")) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
  return "text-slate-400 bg-slate-500/10 border-slate-500/20";
};

// Premium Custom Chart Tooltips
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur-md shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</p>
        <p className="mt-1.5 text-base font-bold text-white">
          ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur-md shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{payload[0].name}</p>
        <p className="mt-1 text-sm font-bold text-white">{payload[0].value}% share</p>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [depositValues, setDepositValues] = useState({});

  // Queries
  const { data: transactions = [], isLoading: isTxLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: () => db.transactions.list(user.id),
    enabled: !!user?.id,
  });

  const { data: portfolio = [], isLoading: isPortfolioLoading } = useQuery({
    queryKey: ["portfolio", user?.id],
    queryFn: () => db.portfolio.list(user.id),
    enabled: !!user?.id,
  });

  const { data: loans = [], isLoading: isLoansLoading } = useQuery({
    queryKey: ["loans", user?.id],
    queryFn: () => db.loans.list(user.id),
    enabled: !!user?.id,
  });

  const { data: savings = [], isLoading: isSavingsLoading } = useQuery({
    queryKey: ["savings", user?.id],
    queryFn: () => db.savings.list(user.id),
    enabled: !!user?.id,
  });

  const { data: budgetData, isLoading: isBudgetLoading } = useQuery({
    queryKey: ["budget", user?.id],
    queryFn: () => db.budgets.get(user.id),
    enabled: !!user?.id,
  });

  // Mutations
  const addTxMutation = useMutation({
    mutationFn: (newTx) => db.transactions.add(user.id, newTx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast.success("Transaction added successfully!");
    },
    onError: () => {
      toast.error("Failed to add transaction.");
    },
  });

  const setBudgetMutation = useMutation({
    mutationFn: (amount) => db.budgets.set(user.id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", user?.id] });
      setIsEditingBudget(false);
      toast.success("Monthly budget updated!");
    },
    onError: () => {
      toast.error("Failed to update budget.");
    },
  });

  const addGoalMutation = useMutation({
    mutationFn: (goal) => db.savings.add(user.id, goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings", user?.id] });
      toast.success("Savings goal created successfully!");
    },
    onError: () => {
      toast.error("Failed to create savings goal.");
    },
  });

  const addSavingsAmountMutation = useMutation({
    mutationFn: ({ goalId, amount }) => db.savings.addSavings(user.id, goalId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings", user?.id] });
      toast.success("Deposit processed successfully!");
    },
    onError: () => {
      toast.error("Failed to process deposit.");
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId) => db.savings.delete(user.id, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings", user?.id] });
      toast.success("Savings goal deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete savings goal.");
    },
  });

  if (isTxLoading || isPortfolioLoading || isLoansLoading || isSavingsLoading || isBudgetLoading) {
    return (
      <Shell>
        <div className="flex h-[60vh] items-center justify-center relative">
          <div className="absolute w-60 h-60 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
          <div className="flex flex-col items-center gap-3 z-10">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
            <span className="text-xs font-semibold tracking-[0.25em] text-cyan-300 uppercase mt-4">
              Loading financial state...
            </span>
          </div>
        </div>
      </Shell>
    );
  }

  // Calculations
  const portfolioValue = portfolio.reduce((sum, item) => sum + item.total_value, 0);
  const savingsValue = savings.reduce((sum, item) => sum + item.current_amount, 0);
  const loansValue = loans.reduce((sum, item) => sum + item.remaining, 0);

  // Cash Balance: Seed Cash 15,000 + income - expenses
  const netCashFlow = transactions.reduce((sum, t) => {
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);
  const cashBalance = Math.max(0, 15000 + netCashFlow);
  const netWorth = cashBalance + portfolioValue + savingsValue - loansValue;

  // Monthly expense calculation
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthlyExpenses = transactions
    .filter(t => t.type === "expense" && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const summary = [
    {
      title: "Net worth",
      value: `$${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: netWorth >= 15000 ? "+14.2%" : "-2.5%",
      detail: "Assets vs Liabilities",
      type: "net-worth",
      icon: PiggyBank,
      iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Monthly spend",
      value: `$${monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: monthlyExpenses > (budgetData?.monthly_budget || 5000) ? "+10.4%" : "-4.8%",
      detail: `${currentMonthStr} Expenses`,
      type: "spend",
      icon: Coins,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Investments",
      value: `$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+8.9%",
      detail: `${portfolio.length} active holdings`,
      type: "investments",
      icon: TrendingUp,
      iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "Total Liabilities",
      value: `$${loansValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "-1.8%",
      detail: `${loans.length} active debts`,
      type: "liabilities",
      icon: Landmark,
      iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  // Spending Category chart data from transactions
  const expenseCategories = {};
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    });

  const spendingChartData = Object.entries(expenseCategories).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  })).slice(0, 6);

  // Fallback data
  const finalSpendingData = spendingChartData.length > 0
    ? spendingChartData
    : [
        { name: "Housing", value: 1500 },
        { name: "Food", value: 450 },
        { name: "Travel", value: 200 }
      ];

  // Allocations group by asset class
  const classMap = {};
  portfolio.forEach(a => {
    classMap[a.asset_type] = (classMap[a.asset_type] || 0) + a.total_value;
  });
  if (cashBalance > 0) classMap["Cash"] = (classMap["Cash"] || 0) + cashBalance;
  if (savingsValue > 0) classMap["Savings"] = (classMap["Savings"] || 0) + savingsValue;

  const totalAllocationSum = Object.values(classMap).reduce((sum, v) => sum + v, 0);
  const allocations = Object.entries(classMap).map(([name, val]) => ({
    name,
    value: totalAllocationSum > 0 ? Math.round((val / totalAllocationSum) * 100) : 0,
  })).filter(item => item.value > 0);

  const finalAllocations = allocations.length > 0
    ? allocations
    : [
        { name: "Cash", value: 40 },
        { name: "Equities", value: 45 },
        { name: "Bonds", value: 15 }
      ];

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 relative min-h-screen">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40rem] right-10 w-96 h-96 rounded-full bg-violet-500/5 blur-[150px] pointer-events-none" />

        {/* Top welcome */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">
                Financial intelligence workspace
              </p>
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
              Hello, {user?.name.split(" ")[0]}
            </h1>
          </div>
          <Button 
            onClick={() => setIsAddTxOpen(true)} 
            className="w-fit py-6 px-6 rounded-2xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-500 hover:to-cyan-500 text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3]" />
            Record Transaction
          </Button>
        </div>

        {/* Top KPIs */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4 relative z-10">
          {summary.map((item, idx) => {
            const isSpend = item.type === "spend";
            const IconComponent = item.icon;
            
            if (isSpend) {
              return (
                <motion.div 
                  key={item.title} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.4, delay: idx * 0.08 }} 
                  className="relative group h-full"
                >
                  {isEditingBudget ? (
                    <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl h-full flex flex-col justify-between p-6 rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.3)] border-[1px]">
                      <div className="pb-3 border-b border-white/5">
                        <CardTitle className="text-sm font-semibold tracking-wide text-slate-400">Set Monthly Budget</CardTitle>
                        <CardDescription className="text-xs text-slate-500 mt-1">Define monthly spending limit</CardDescription>
                      </div>
                      <div className="pt-4 flex-1 flex flex-col justify-end">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">$</span>
                            <input 
                              type="number" 
                              placeholder="Limit" 
                              value={newBudgetAmount} 
                              onChange={(e) => setNewBudgetAmount(e.target.value)} 
                              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-400/50 focus:bg-white/10 transition"
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={async () => {
                              const amt = parseFloat(newBudgetAmount);
                              if (!isNaN(amt) && amt > 0) {
                                await setBudgetMutation.mutateAsync(amt);
                              } else {
                                toast.error("Please enter a valid positive number");
                              }
                            }} 
                            disabled={setBudgetMutation.isPending} 
                            className="rounded-xl bg-cyan-400 hover:bg-cyan-500 text-slate-950 p-2 font-bold flex items-center justify-center cursor-pointer transition shadow-[0_4px_12px_rgba(34,211,238,0.2)]"
                          >
                            <Check className="h-4 w-4 stroke-[3]" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsEditingBudget(false)} 
                            className="rounded-xl border border-white/15 bg-transparent text-slate-400 hover:text-white p-2 flex items-center justify-center cursor-pointer transition hover:bg-white/5"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl h-full p-6 rounded-[2rem] transition-all duration-300 hover:border-cyan-500/25 group-hover:shadow-[0_12px_40px_rgba(34,211,238,0.03)] relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-xl p-2.5 border-[1px] ${item.iconColor}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.title}</CardTitle>
                              <CardDescription className="text-[11px] font-medium text-slate-400 mt-0.5">
                                {budgetData?.monthly_budget
                                  ? `Limit: $${budgetData.monthly_budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : "No limit set"}
                              </CardDescription>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setIsEditingBudget(true);
                              setNewBudgetAmount(budgetData?.monthly_budget ? budgetData.monthly_budget.toString() : "");
                            }} 
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-slate-400 hover:text-cyan-300 p-1.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer flex items-center justify-center hover:scale-105" 
                            title="Edit Budget Limit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-5 flex items-baseline justify-between">
                          <p className="text-3xl font-extrabold text-white tracking-tight">
                            {item.value}
                          </p>
                          {budgetData?.monthly_budget && (
                            <span className={`flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${monthlyExpenses > budgetData.monthly_budget
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                              {Math.round((monthlyExpenses / budgetData.monthly_budget) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        {budgetData?.monthly_budget ? (
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${monthlyExpenses > budgetData.monthly_budget
                                ? "bg-gradient-to-r from-rose-500 to-red-600"
                                : (monthlyExpenses / budgetData.monthly_budget) > 0.85
                                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                  : "bg-gradient-to-r from-cyan-400 to-emerald-400"}`} 
                              style={{ width: `${Math.min(100, (monthlyExpenses / budgetData.monthly_budget) * 100)}%` }}
                            />
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setIsEditingBudget(true);
                              setNewBudgetAmount("");
                            }} 
                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline bg-transparent border-0 cursor-pointer p-0"
                          >
                            Set budget limit
                          </button>
                        )}
                      </div>
                    </Card>
                  )}
                </motion.div>
              );
            }

            return (
              <motion.div 
                key={item.title} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl h-full p-6 rounded-[2rem] transition-all duration-300 hover:border-cyan-500/25 relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 border-[1px] ${item.iconColor}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.title}</CardTitle>
                      <CardDescription className="text-[11px] font-medium text-slate-400 mt-0.5">{item.detail}</CardDescription>
                    </div>
                  </div>
                  <div className="mt-5 flex items-baseline justify-between">
                    <p className="text-3xl font-extrabold text-white tracking-tight">
                      {item.value}
                    </p>
                    <span className={`flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${item.change.startsWith("+")
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                      {item.change.startsWith("+") ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {item.change}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts & Allocations */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.22fr_0.78fr] relative z-10">
          {/* Spend Category Bar Chart */}
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2.25rem] overflow-hidden p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <CardHeader className="p-0 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Spending Analysis</CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Outflow categorisation across channels
                  </CardDescription>
                </div>
                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs text-cyan-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                  </span>
                  Live Feed
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finalSpendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient key={`gradient-${index}`} id={`colorBar-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.85} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.15} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.03)" }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {finalSpendingData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#colorBar-${index % COLORS.length})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Allocation Pie Chart */}
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2.25rem] p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-bold text-white">Asset Allocation</CardTitle>
              <CardDescription className="text-xs text-slate-400">Total capital distribution</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={finalAllocations} 
                      dataKey="value" 
                      innerRadius={68} 
                      outerRadius={88} 
                      paddingAngle={3}
                    >
                      {finalAllocations.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(2, 6, 23, 0.5)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center total info overlay */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Total Capital</span>
                  <span className="text-2xl font-extrabold tracking-[-0.03em] text-white mt-1">
                    ${(portfolioValue + cashBalance + savingsValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                {finalAllocations.map((item, index) => (
                  <div 
                    key={item.name} 
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions & Savings */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] relative z-10">
          {/* Live Recent Transactions */}
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2.25rem] p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-lg font-bold text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Latest cash flow across your account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx) => {
                    const CategoryIcon = getCategoryIcon(tx.category);
                    const tagStyle = getCategoryColor(tx.category);
                    return (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/20 px-4 py-3.5 hover:bg-slate-900/40 transition duration-200"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`rounded-xl p-2.5 border-[1px] ${tagStyle}`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-white">
                              {tx.description}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {tx.category} · {tx.date}
                            </p>
                          </div>
                        </div>
                        <p className={`font-bold text-sm ${tx.type === "income" ? "text-emerald-400" : "text-white"}`}>
                          {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-[1.5rem] text-slate-500 text-xs font-medium">
                    No transactions recorded yet. Click "Record Transaction" to begin.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Savings Goals */}
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2.25rem] p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <CardHeader className="p-0 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Savings Targets</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Track and contribute to goals</CardDescription>
                </div>
                <Button 
                  onClick={() => setIsAddGoalOpen(true)} 
                  size="sm" 
                  className="rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/20 flex items-center justify-center cursor-pointer transition font-semibold"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {savings.length > 0 ? (
                savings.map((goal) => {
                  const percent = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
                  const isAchieved = goal.current_amount >= goal.target_amount;
                  return (
                    <div 
                      key={goal.id} 
                      className="rounded-2xl border border-white/5 bg-slate-900/20 p-4 space-y-4 relative group/goal"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-xl p-2.5 border-[1px] ${isAchieved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"}`}>
                            <PiggyBank className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">{goal.name}</p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {goal.category} · Target: {goal.target_date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isAchieved
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"}`}>
                            {percent}%
                          </span>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
                                deleteGoalMutation.mutate(goal.id);
                              }
                            }} 
                            className="opacity-0 group-hover/goal:opacity-100 transition duration-200 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer" 
                            title="Delete Goal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isAchieved
                              ? "bg-gradient-to-r from-emerald-400 to-green-500"
                              : "bg-gradient-to-r from-cyan-400 to-indigo-500"}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-400">
                          <span>${goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} saved</span>
                          <span>${goal.target_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} target</span>
                        </div>
                      </div>

                      {/* Deposit Input & Button */}
                      {!isAchieved && (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">$</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              placeholder="Deposit amount" 
                              value={depositValues[goal.id] || ""} 
                              onChange={(e) => setDepositValues({
                                ...depositValues,
                                [goal.id]: e.target.value
                              })} 
                              className="w-full rounded-xl border border-white/5 bg-slate-950/40 py-2 pl-7 pr-3 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-400/50 focus:bg-white/10 transition"
                            />
                          </div>
                          <Button 
                            onClick={async () => {
                              const amountStr = depositValues[goal.id];
                              const amt = parseFloat(amountStr);
                              if (!isNaN(amt) && amt > 0) {
                                await addSavingsAmountMutation.mutateAsync({ goalId: goal.id, amount: amt });
                                setDepositValues({
                                  ...depositValues,
                                  [goal.id]: ""
                                });
                              } else {
                                toast.error("Please enter a valid positive deposit amount");
                              }
                            }} 
                            disabled={addSavingsAmountMutation.isPending} 
                            size="sm" 
                            className="rounded-xl bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-semibold py-2 px-3 cursor-pointer"
                          >
                            Deposit
                          </Button>
                        </div>
                      )}
                      
                      {isAchieved && (
                        <p className="text-xs text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-2 text-center flex items-center justify-center gap-1.5">
                          <span>🎉</span> Goal completed! Excellent work saving.
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-[1.75rem]">
                  <PiggyBank className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-semibold">No savings goals created yet</p>
                  <p className="text-xs text-slate-500 mt-1 mb-5">Set up a target to begin automating your savings</p>
                  <Button 
                    onClick={() => setIsAddGoalOpen(true)} 
                    size="sm" 
                    className="rounded-xl bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-semibold cursor-pointer"
                  >
                    Create a Goal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddTxOpen} 
        onClose={() => setIsAddTxOpen(false)} 
        onSuccess={async (data) => {
          await addTxMutation.mutateAsync(data);
        }}
      />

      {/* Add Savings Goal Modal */}
      <AddSavingsGoalModal 
        isOpen={isAddGoalOpen} 
        onClose={() => setIsAddGoalOpen(false)} 
        onSuccess={async (data) => {
          await addGoalMutation.mutateAsync(data);
        }}
      />
    </Shell>
  );
}
