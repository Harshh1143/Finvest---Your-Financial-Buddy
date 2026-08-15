import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  PiggyBank, Plus, ArrowUpRight, ArrowDownRight, Trash2, Edit3, Check, X,
  Home, Utensils, Zap, ShoppingBag, Plane, Play, Coins, TrendingUp, Landmark, Activity,
  ChevronRight
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Shell } from "../components/layout/shell";
import { db } from "../lib/db";
import { useAuth } from "../components/providers/auth-provider";
import { AddTransactionModal } from "../components/modals/AddTransactionModal";
import { AddSavingsGoalModal } from "../components/modals/AddSavingsGoalModal";
import { toast } from "sonner";
import { formatCurrency, getCurrencySymbol, exchangeRates } from "../lib/currency";

// Curated Royal Cobalt & Silver/Cream Palette for Charts
const CHART_COLORS = ["#2b5cb8", "#4477d6", "#8c9cb3", "#b3c1d4", "#50627e", "#1b3f80"];

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

// Option B: Unified monochrome for expenses, Cobalt accent for positive flows (income)
const getCategoryColor = (category, type) => {
  if (type === "income" || category.toLowerCase().includes("salary") || category.toLowerCase().includes("income")) {
    return "text-brand-cobalt-light bg-brand-cobalt/10 border-brand-cobalt/20";
  }
  return "text-brand-silver bg-brand-cream/5 border-brand-cream/10 hover:border-brand-cobalt/30 hover:bg-brand-cream/10";
};

// Custom Chart Tooltips (Geist Mono & Minimalist)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-brand-cream/10 bg-brand-midnight-card px-4 py-3 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-silver font-mono">{label}</p>
        <p className="mt-1 text-sm font-bold text-brand-cream font-mono">
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
      <div className="rounded-xl border border-brand-cream/10 bg-brand-midnight-card px-4 py-3 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-silver font-mono">{payload[0].name}</p>
        <p className="mt-1 text-sm font-bold text-brand-cream font-mono">{payload[0].value}% share</p>
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
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const dismissed = localStorage.getItem(`finvest_onboarding_dismissed_${user.id}`) === "true";
      setIsOnboardingDismissed(dismissed);
    }
  }, [user?.id]);

  const handleDismissOnboarding = () => {
    if (user?.id) {
      localStorage.setItem(`finvest_onboarding_dismissed_${user.id}`, "true");
    }
    setIsOnboardingDismissed(true);
  };

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
    mutationFn: (newTx) => {
      const userCurrency = user?.settings?.currency || 'USD';
      const rate = exchangeRates[userCurrency] || 1;
      const convertedTx = {
        ...newTx,
        amount: parseFloat(newTx.amount) / rate
      };
      return db.transactions.add(user.id, convertedTx);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] });
      toast.success("Transaction added successfully!");
    },
    onError: () => {
      toast.error("Failed to add transaction.");
    },
  });

  const setBudgetMutation = useMutation({
    mutationFn: (amount) => {
      const userCurrency = user?.settings?.currency || 'USD';
      const rate = exchangeRates[userCurrency] || 1;
      return db.budgets.set(user.id, amount / rate);
    },
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
    mutationFn: (newGoal) => {
      const userCurrency = user?.settings?.currency || 'USD';
      const rate = exchangeRates[userCurrency] || 1;
      const payload = {
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.target_amount) / rate,
        currentAmount: 0,
        targetDate: newGoal.target_date,
        category: newGoal.category
      };
      return db.savings.add(user.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings", user?.id] });
      toast.success("Savings goal created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create savings goal.");
    },
  });

  const addSavingsAmountMutation = useMutation({
    mutationFn: ({ goalId, amount }) => {
      const userCurrency = user?.settings?.currency || 'USD';
      const rate = exchangeRates[userCurrency] || 1;
      return db.savings.addSavings(user.id, goalId, amount / rate);
    },
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
          <div className="absolute w-60 h-60 rounded-full bg-brand-cobalt/5 blur-[100px] animate-pulse" />
          <div className="flex flex-col items-center gap-3 z-10">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-cobalt border-t-transparent" />
            <span className="text-xs font-semibold tracking-[0.25em] text-brand-silver uppercase mt-4">
              Loading financial state...
            </span>
          </div>
        </div>
      </Shell>
    );
  }

  // Calculations
  const portfolioValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  const savingsValue = savings.reduce((sum, item) => sum + item.currentAmount, 0);
  const loansValue = loans.reduce((sum, item) => sum + item.remaining, 0);

  // Cash Balance: income - expenses
  const netCashFlow = transactions.reduce((sum, t) => {
    return t.type === "income" ? sum + t.amount : sum - t.amount;
  }, 0);
  const cashBalance = Math.max(0, netCashFlow);
  const netWorth = cashBalance + portfolioValue + savingsValue - loansValue;

  // Monthly expense calculation
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthlyExpenses = transactions
    .filter(t => t.type === "expense" && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const summary = [
    {
      title: "Net worth",
      value: formatCurrency(netWorth, user),
      change: netWorth === 0 ? "0.0%" : (netWorth > 0 ? "+14.2%" : "-2.5%"),
      detail: "Assets vs Liabilities",
      type: "net-worth",
      icon: PiggyBank,
      iconColor: "text-brand-cream bg-brand-cobalt/10 border-brand-cobalt/20",
    },
    {
      title: "Monthly spend",
      value: formatCurrency(monthlyExpenses, user),
      change: monthlyExpenses > (budgetData?.monthlyBudget || 5000) ? "+10.4%" : "-4.8%",
      detail: `${currentMonthStr} Expenses`,
      type: "spend",
      icon: Coins,
      iconColor: "text-brand-cream bg-brand-cream/5 border-brand-cream/10",
    },
    {
      title: "Investments",
      value: formatCurrency(portfolioValue, user),
      change: "+8.9%",
      detail: `${portfolio.length} active holdings`,
      type: "investments",
      icon: TrendingUp,
      iconColor: "text-brand-cream bg-brand-cobalt/10 border-brand-cobalt/20",
    },
    {
      title: "Total Liabilities",
      value: formatCurrency(loansValue, user),
      change: "-1.8%",
      detail: `${loans.length} active debts`,
      type: "liabilities",
      icon: Landmark,
      iconColor: "text-brand-cream bg-brand-cream/5 border-brand-cream/10",
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
    classMap[a.assetType] = (classMap[a.assetType] || 0) + a.totalValue;
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

  const isDataEmpty = transactions.length === 0 && portfolio.length === 0 && loans.length === 0 && savings.length === 0;
  const showOnboarding = !isOnboardingDismissed && isDataEmpty;

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 relative min-h-screen">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-brand-cobalt/5 blur-[120px] pointer-events-none" />

        {/* Top welcome */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5 rounded-full bg-brand-cobalt-light" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-silver font-mono">
                Financial intelligence workspace
              </p>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-cream">
              Hello, {user?.name.split(" ")[0]}
            </h1>
          </div>
          <Button 
            onClick={() => setIsAddTxOpen(true)} 
            className="w-fit bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold py-3.5 px-6 rounded-lg transition"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[3]" />
            Record Transaction
          </Button>
        </div>

        {/* Onboarding Guide */}
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 relative rounded-2xl border border-brand-cobalt/20 bg-brand-midnight-card/85 p-6 lg:p-8 overflow-hidden shadow-2xl z-10"
          >
            {/* Ambient subtle cobalt backdrop */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-brand-cobalt/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-cobalt-light animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-cobalt-light font-mono">
                    Workspace Initialization
                  </span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-brand-cream">
                  Set up your core workspace features
                </h2>
                <p className="text-xs text-brand-silver leading-relaxed">
                  To experience the full capability of Finvest, initialize your dashboard by setting up your active portfolios, budget parameters, and savings targets. You can manage these at any time.
                </p>
              </div>

              <div className="flex items-center gap-3 self-end md:self-start">
                <Button
                  onClick={handleDismissOnboarding}
                  variant="outline"
                  className="py-2.5 px-4 text-xs font-semibold text-brand-silver border-brand-cream/10 bg-transparent hover:text-brand-cream hover:bg-brand-cream/5 rounded-lg transition"
                >
                  Do it later
                </Button>
              </div>
            </div>

            {/* Quickstart Actions Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-brand-cream/5 pt-6 relative z-20">
              
              {/* Feature 1: Portfolio Assets */}
              <Link to="/portfolio" className="group block">
                <div className="rounded-xl border border-brand-cream/5 bg-brand-cream/5 p-4 hover:border-brand-cobalt/35 hover:bg-brand-cream/10 transition-all duration-200 h-full flex flex-col justify-between cursor-pointer">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-cobalt/10 border border-brand-cobalt/20 text-brand-cobalt-light flex items-center justify-center">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-xs font-bold text-brand-cream group-hover:text-brand-cobalt-light transition">
                      Configure Portfolio Assets
                    </h3>
                    <p className="text-[10px] text-brand-silver/70 leading-normal">
                      Connect stocks, crypto, gold, or custom equities.
                    </p>
                  </div>
                  <span className="text-[9px] font-bold tracking-wider text-brand-cobalt-light uppercase font-mono mt-4 inline-flex items-center gap-1.5">
                    Open Portfolio <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                  </span>
                </div>
              </Link>

              {/* Feature 2: Savings Goal */}
              <button 
                onClick={() => setIsAddGoalOpen(true)} 
                className="group block text-left w-full cursor-pointer bg-transparent border-0 p-0"
              >
                <div className="rounded-xl border border-brand-cream/5 bg-brand-cream/5 p-4 hover:border-brand-cobalt/35 hover:bg-brand-cream/10 transition-all duration-200 h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-cobalt/10 border border-brand-cobalt/20 text-brand-cobalt-light flex items-center justify-center">
                      <PiggyBank className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-xs font-bold text-brand-cream group-hover:text-brand-cobalt-light transition">
                      Add Savings Goal
                    </h3>
                    <p className="text-[10px] text-brand-silver/70 leading-normal">
                      Set target objectives and automate deposits.
                    </p>
                  </div>
                  <span className="text-[9px] font-bold tracking-wider text-brand-cobalt-light uppercase font-mono mt-4 inline-flex items-center gap-1.5">
                    Create Goal <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                  </span>
                </div>
              </button>

              {/* Feature 3: Record Transaction */}
              <button 
                onClick={() => setIsAddTxOpen(true)} 
                className="group block text-left w-full cursor-pointer bg-transparent border-0 p-0"
              >
                <div className="rounded-xl border border-brand-cream/5 bg-brand-cream/5 p-4 hover:border-brand-cobalt/35 hover:bg-brand-cream/10 transition-all duration-200 h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-cobalt/10 border border-brand-cobalt/20 text-brand-cobalt-light flex items-center justify-center">
                      <Plus className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-xs font-bold text-brand-cream group-hover:text-brand-cobalt-light transition">
                      Log First Transaction
                    </h3>
                    <p className="text-[10px] text-brand-silver/70 leading-normal">
                      Record income cashflow or daily outflow expenses.
                    </p>
                  </div>
                  <span className="text-[9px] font-bold tracking-wider text-brand-cobalt-light uppercase font-mono mt-4 inline-flex items-center gap-1.5">
                    Record flow <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                  </span>
                </div>
              </button>

              {/* Feature 4: Liabilities & Loans */}
              <Link to="/loans" className="group block">
                <div className="rounded-xl border border-brand-cream/5 bg-brand-cream/5 p-4 hover:border-brand-cobalt/35 hover:bg-brand-cream/10 transition-all duration-200 h-full flex flex-col justify-between cursor-pointer">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-cobalt/10 border border-brand-cobalt/20 text-brand-cobalt-light flex items-center justify-center">
                      <Landmark className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-xs font-bold text-brand-cream group-hover:text-brand-cobalt-light transition">
                      Track Active Loans
                    </h3>
                    <p className="text-[10px] text-brand-silver/70 leading-normal">
                      Keep track of student loans, mortgages, or EMI details.
                    </p>
                  </div>
                  <span className="text-[9px] font-bold tracking-wider text-brand-cobalt-light uppercase font-mono mt-4 inline-flex items-center gap-1.5">
                    Manage Debts <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                  </span>
                </div>
              </Link>

            </div>
          </motion.div>
        )}

        {/* Top KPIs */}
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4 relative z-10">
          {summary.map((item, idx) => {
            const isSpend = item.type === "spend";
            const IconComponent = item.icon;
            
            if (isSpend) {
              return (
                <motion.div 
                  key={item.title} 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.3, delay: idx * 0.05 }} 
                  className="relative group h-full"
                >
                  {isEditingBudget ? (
                    <Card className="border-brand-cream/5 bg-brand-midnight-card h-full flex flex-col justify-between p-6 rounded-2xl border">
                      <div className="pb-3 border-b border-brand-cream/5">
                        <CardTitle className="text-xs font-bold tracking-wider text-brand-silver uppercase">Set Monthly Budget</CardTitle>
                        <CardDescription className="text-[10px] text-brand-silver/60 mt-1">Define monthly spending limit</CardDescription>
                      </div>
                      <div className="pt-4 flex-1 flex flex-col justify-end">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-silver font-mono">$</span>
                            <input 
                              type="number" 
                              placeholder="Limit" 
                              value={newBudgetAmount} 
                              onChange={(e) => setNewBudgetAmount(e.target.value)} 
                              className="w-full rounded-lg border border-brand-cream/10 bg-brand-midnight px-8 py-2 text-xs text-brand-cream placeholder-brand-silver/40 outline-none focus:border-brand-cobalt transition font-mono"
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
                            className="rounded-lg bg-brand-cobalt hover:bg-brand-cobalt-light text-brand-cream p-2 font-bold flex items-center justify-center cursor-pointer transition"
                          >
                            <Check className="h-4 w-4 stroke-[3]" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setIsEditingBudget(false)} 
                            className="rounded-lg border border-brand-cream/10 bg-transparent text-brand-silver hover:text-brand-cream p-2 flex items-center justify-center cursor-pointer transition hover:bg-brand-cream/5"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="border-brand-cream/5 bg-brand-midnight-card/75 h-full p-6 rounded-2xl transition-all duration-300 hover:border-brand-cobalt/35 relative overflow-hidden flex flex-col justify-between group border">
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-lg p-2 border ${item.iconColor}`}>
                              <IconComponent className="h-4 w-4 text-brand-silver" />
                            </div>
                            <div>
                              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-brand-silver">{item.title}</CardTitle>
                              <CardDescription className="text-[10px] font-mono text-brand-silver/65 mt-0.5">
                                {budgetData?.monthlyBudget
                                  ? `Limit: $${budgetData.monthlyBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : "No limit set"}
                              </CardDescription>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setIsEditingBudget(true);
                              setNewBudgetAmount(budgetData?.monthlyBudget ? budgetData.monthlyBudget.toString() : "");
                            }} 
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-brand-silver hover:text-brand-cream p-1.5 rounded-lg bg-brand-cream/5 border border-brand-cream/10 cursor-pointer flex items-center justify-center" 
                            title="Edit Budget Limit"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="mt-5 flex items-baseline justify-between">
                          <p className="text-2xl font-bold text-brand-cream tracking-tight font-mono">
                            {item.value}
                          </p>
                          {budgetData?.monthlyBudget && (
                            <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold border font-mono ${monthlyExpenses > budgetData.monthlyBudget
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-brand-cobalt/10 text-brand-cream border-brand-cobalt/20"}`}>
                              {Math.round((monthlyExpenses / budgetData.monthlyBudget) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        {budgetData?.monthlyBudget ? (
                          <div className="w-full bg-brand-midnight rounded-full h-1 overflow-hidden border border-brand-cream/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${monthlyExpenses > budgetData.monthlyBudget
                                ? "bg-red-500"
                                : (monthlyExpenses / budgetData.monthlyBudget) > 0.85
                                  ? "bg-amber-500"
                                  : "bg-brand-cobalt-light"}`} 
                              style={{ width: `${Math.min(100, (monthlyExpenses / budgetData.monthlyBudget) * 100)}%` }}
                            />
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setIsEditingBudget(true);
                              setNewBudgetAmount("");
                            }} 
                            className="text-xs font-semibold text-brand-cobalt-light hover:underline bg-transparent border-0 cursor-pointer p-0"
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
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="border-brand-cream/5 bg-brand-midnight-card/75 h-full p-6 rounded-2xl transition-all duration-300 hover:border-brand-cobalt/35 relative overflow-hidden flex flex-col justify-between group border">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 border ${item.iconColor}`}>
                      <IconComponent className="h-4 w-4 text-brand-silver" />
                    </div>
                    <div>
                      <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-brand-silver">{item.title}</CardTitle>
                      <CardDescription className="text-[10px] text-brand-silver/65 mt-0.5">{item.detail}</CardDescription>
                    </div>
                  </div>
                  <div className="mt-5 flex items-baseline justify-between">
                    <p className="text-2xl font-bold text-brand-cream tracking-tight font-mono">
                      {item.value}
                    </p>
                    <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold border font-mono ${item.change.startsWith("+")
                      ? "bg-brand-cobalt/10 text-brand-cream border-brand-cobalt/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                      {item.change.startsWith("+") ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
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
          <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl overflow-hidden p-6 relative border">
            <CardHeader className="p-0 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-brand-cream">Spending Analysis</CardTitle>
                  <CardDescription className="text-xs text-brand-silver">
                    Outflow categorisation across channels
                  </CardDescription>
                </div>
                <div className="rounded-full border border-brand-cobalt/25 bg-brand-cobalt/10 px-3 py-1 text-[10px] text-brand-cream font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-cobalt-light animate-pulse" />
                  Live Flow
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {spendingChartData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendingChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        {CHART_COLORS.map((color, index) => (
                          <linearGradient key={`gradient-${index}`} id={`colorBar-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.15} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(251,250,247,0.03)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#8c9cb3", fontSize: 10, fontWeight: 500, fontFamily: "var(--font-sans)" }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#8c9cb3", fontSize: 10, fontFamily: "var(--font-mono)" }}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(251, 250, 247, 0.02)" }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {spendingChartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#colorBar-${index % CHART_COLORS.length})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center border border-dashed border-brand-cream/10 rounded-xl px-4 text-center bg-brand-cream/[0.01]">
                  <Activity className="h-8 w-8 text-brand-silver/40 mb-3 animate-pulse" />
                  <p className="text-xs text-brand-cream font-bold uppercase tracking-wider font-mono">No spending logged yet</p>
                  <p className="text-[10px] text-brand-silver/60 mt-1 max-w-xs leading-relaxed">Your outflow category distributions will populate here as you record expenses.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allocation Pie Chart */}
          <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl p-6 relative border">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold text-brand-cream">Asset Allocation</CardTitle>
              <CardDescription className="text-xs text-brand-silver">Total capital distribution</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {allocations.length > 0 ? (
                <>
                  <div className="h-56 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={allocations} 
                          dataKey="value" 
                          innerRadius={68} 
                          outerRadius={84} 
                          paddingAngle={3}
                        >
                          {allocations.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="#091225" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Center total info overlay */}
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-brand-silver">Total Capital</span>
                      <span className="text-xl font-bold tracking-tight text-brand-cream mt-1 font-mono">
                        {formatCurrency(portfolioValue + cashBalance + savingsValue, user)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {allocations.map((item, index) => (
                      <div 
                        key={item.name} 
                        className="flex items-center justify-between rounded-xl border border-brand-cream/5 bg-brand-cream/5 px-3 py-2 text-xs text-brand-silver"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                          <span className="font-semibold">{item.name}</span>
                        </div>
                        <span className="font-bold text-brand-cream font-mono">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-brand-cream/10 rounded-xl px-4 text-center bg-brand-cream/[0.01]">
                  <TrendingUp className="h-8 w-8 text-brand-silver/40 mb-3" />
                  <p className="text-xs text-brand-cream font-bold uppercase tracking-wider font-mono">No assets allocated yet</p>
                  <p className="text-[10px] text-brand-silver/60 mt-1 max-w-xs leading-relaxed">Your capital distribution across stocks, cash, bonds, and savings will show up here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transactions & Savings */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] relative z-10">
          {/* Live Recent Transactions */}
          <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl p-6 relative border">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-base font-bold text-brand-cream">Recent Transactions</CardTitle>
              <CardDescription className="text-xs text-brand-silver">
                Latest cash flow across your account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx) => {
                    const CategoryIcon = getCategoryIcon(tx.category);
                    const tagStyle = getCategoryColor(tx.category, tx.type);
                    return (
                      <div 
                        key={tx._id} 
                        className="flex items-center justify-between rounded-xl border border-brand-cream/5 bg-brand-cream/5 px-4 py-3.5 hover:border-brand-cobalt/25 hover:bg-brand-cream/10 transition duration-200"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`rounded-lg p-2 border transition ${tagStyle}`}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-brand-cream">
                              {tx.description}
                            </p>
                            <p className="text-[10px] font-medium text-brand-silver mt-0.5">
                              {tx.category} · {tx.date}
                            </p>
                          </div>
                        </div>
                        <p className={`font-bold text-xs font-mono ${tx.type === "income" ? "text-brand-cobalt-light" : "text-brand-cream"}`}>
                          {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, user)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 border border-dashed border-brand-cream/10 rounded-xl text-brand-silver text-xs font-medium font-mono">
                    No transactions recorded yet. Click "Record Transaction" to begin.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Savings Goals */}
          <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl p-6 relative border">
            <CardHeader className="p-0 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-brand-cream">Savings Targets</CardTitle>
                  <CardDescription className="text-xs text-brand-silver">Track and contribute to goals</CardDescription>
                </div>
                <Button 
                  onClick={() => setIsAddGoalOpen(true)} 
                  size="sm" 
                  className="rounded-lg bg-brand-cobalt/10 hover:bg-brand-cobalt/20 text-brand-cream border border-brand-cobalt/20 flex items-center justify-center cursor-pointer transition font-semibold"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {savings.length > 0 ? (
                savings.map((goal) => {
                  const percent = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
                  const isAchieved = goal.currentAmount >= goal.targetAmount;
                  return (
                    <div 
                      key={goal._id} 
                      className="rounded-xl border border-brand-cream/5 bg-brand-cream/5 p-4 space-y-4 relative group/goal"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 border ${isAchieved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-brand-cobalt/10 text-brand-cobalt-light border-brand-cobalt/20"}`}>
                            <PiggyBank className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-brand-cream">{goal.name}</p>
                            <p className="text-[10px] font-medium text-brand-silver mt-0.5">
                              {goal.category} · Target: {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono ${isAchieved
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-brand-cobalt/10 text-brand-cream border-brand-cobalt/20"}`}>
                            {percent}%
                          </span>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
                                deleteGoalMutation.mutate(goal._id);
                              }
                            }} 
                            className="opacity-0 group-hover/goal:opacity-100 transition duration-200 text-brand-silver hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer" 
                            title="Delete Goal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-brand-midnight rounded-full h-1 overflow-hidden border border-brand-cream/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${isAchieved
                              ? "bg-emerald-500"
                              : "bg-brand-cobalt-light"}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-medium text-brand-silver font-mono">
                          <span>{formatCurrency(goal.currentAmount, user)} saved</span>
                          <span>{formatCurrency(goal.targetAmount, user)} target</span>
                        </div>
                      </div>

                      {/* Deposit Input & Button */}
                      {!isAchieved && (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-silver font-mono">{getCurrencySymbol(user)}</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              placeholder="Deposit amount" 
                              value={depositValues[goal._id] || ""} 
                              onChange={(e) => setDepositValues({
                                ...depositValues,
                                [goal._id]: e.target.value
                              })} 
                              className="w-full rounded-lg border border-brand-cream/5 bg-brand-midnight py-2 pl-7 pr-3 text-xs text-brand-cream placeholder-brand-silver/30 outline-none focus:border-brand-cobalt transition font-mono"
                            />
                          </div>
                          <Button 
                            onClick={async () => {
                              const amountStr = depositValues[goal._id];
                              const amt = parseFloat(amountStr);
                              if (!isNaN(amt) && amt > 0) {
                                await addSavingsAmountMutation.mutateAsync({ goalId: goal._id, amount: amt });
                                setDepositValues({
                                  ...depositValues,
                                  [goal._id]: ""
                                });
                              } else {
                                toast.error("Please enter a valid positive deposit amount");
                              }
                            }} 
                            disabled={addSavingsAmountMutation.isPending} 
                            size="sm" 
                            className="rounded-lg bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold py-2 px-3 cursor-pointer"
                          >
                            Deposit
                          </Button>
                        </div>
                      )}
                      
                      {isAchieved && (
                        <p className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 rounded-lg py-2 text-center flex items-center justify-center gap-1.5 font-mono">
                          🎉 Goal completed! Excellent work saving.
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 border border-dashed border-brand-cream/10 rounded-xl">
                  <PiggyBank className="h-8 w-8 text-brand-silver mx-auto mb-3" />
                  <p className="text-xs text-brand-cream font-bold uppercase tracking-wider font-mono">No savings goals created yet</p>
                  <p className="text-[10px] text-brand-silver mt-1 mb-5">Set up a target to begin automating your savings</p>
                  <Button 
                    onClick={() => setIsAddGoalOpen(true)} 
                    size="sm" 
                    className="rounded-lg bg-brand-cream text-brand-midnight font-bold hover:bg-brand-cream/90 cursor-pointer"
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
