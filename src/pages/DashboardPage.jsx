import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PiggyBank, Plus, ArrowUpRight, ArrowDownRight, Trash2, Edit3, Check, X, } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Shell } from "../components/layout/shell";
import { db } from "../lib/db";
import { useAuth } from "../components/providers/auth-provider";
import { AddTransactionModal } from "../components/modals/AddTransactionModal";
import { AddSavingsGoalModal } from "../components/modals/AddSavingsGoalModal";
import { toast } from "sonner";
const COLORS = ["#38bdf8", "#a78bfa", "#34d399", "#f59e0b", "#ec4899", "#10b981"];
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
        return (<Shell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"/>
            <span className="text-sm text-slate-400">Loading intelligence...</span>
          </div>
        </div>
      </Shell>);
    }
    // calculations
    const portfolioValue = portfolio.reduce((sum, item) => sum + item.total_value, 0);
    const savingsValue = savings.reduce((sum, item) => sum + item.current_amount, 0);
    const loansValue = loans.reduce((sum, item) => sum + item.remaining, 0);
    // Calculate Cash Balance: Initial seed cash of 15,000 + income - expenses
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
            value: `$${Math.round(netWorth).toLocaleString()}`,
            change: netWorth >= 15000 ? "+14.2%" : "-2.5%",
            detail: "Assets vs Liabilities",
            type: "net-worth",
        },
        {
            title: "Monthly spend",
            value: `$${Math.round(monthlyExpenses).toLocaleString()}`,
            change: monthlyExpenses > 5000 ? "+10.4%" : "-4.8%",
            detail: `${currentMonthStr} Expenses`,
            type: "spend",
        },
        {
            title: "Investments",
            value: `$${Math.round(portfolioValue).toLocaleString()}`,
            change: "+8.9%",
            detail: `${portfolio.length} active holdings`,
            type: "investments",
        },
        {
            title: "Total Liabilities",
            value: `$${Math.round(loansValue).toLocaleString()}`,
            change: "-1.8%",
            detail: `${loans.length} active debts`,
            type: "liabilities",
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
    // Fallback if no category spend exists
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
    // Add cash/savings to allocation
    if (cashBalance > 0)
        classMap["Cash"] = (classMap["Cash"] || 0) + cashBalance;
    if (savingsValue > 0)
        classMap["Savings"] = (classMap["Savings"] || 0) + savingsValue;
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
    return (<Shell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Top welcome */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wider text-cyan-300 uppercase">Financial Intelligence</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Hello, {user?.name.split(" ")[0]}
            </h1>
          </div>
          <Button onClick={() => setIsAddTxOpen(true)} className="w-fit py-5 rounded-2xl font-semibold bg-cyan-400 hover:bg-cyan-500 text-slate-950">
            <Plus className="mr-2 h-4 w-4"/>
            Add transaction
          </Button>
        </div>

        {/* Top KPIs */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.map((item, idx) => {
            const isSpend = item.type === "spend";
            if (isSpend) {
                return (<motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="relative group">
                  {isEditingBudget ? (<Card className="border-white/10 bg-slate-950/65 backdrop-blur-xl h-full flex flex-col justify-between">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Set Monthly Budget</CardTitle>
                        <CardDescription className="text-xs text-slate-500">Define spending limit</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2 flex-1 flex flex-col justify-end">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                            <input type="number" placeholder="Limit" value={newBudgetAmount} onChange={(e) => setNewBudgetAmount(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-7 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400/50 focus:bg-white/10"/>
                          </div>
                          <button type="button" onClick={async () => {
                            const amt = parseFloat(newBudgetAmount);
                            if (!isNaN(amt) && amt > 0) {
                                await setBudgetMutation.mutateAsync(amt);
                            }
                            else {
                                toast.error("Please enter a valid positive number");
                            }
                        }} disabled={setBudgetMutation.isPending} className="rounded-xl bg-cyan-400 hover:bg-cyan-500 text-slate-950 p-2 font-semibold flex items-center justify-center cursor-pointer transition">
                            <Check className="h-4 w-4"/>
                          </button>
                          <button type="button" onClick={() => setIsEditingBudget(false)} className="rounded-xl border border-white/10 bg-transparent text-slate-400 hover:text-white p-2 flex items-center justify-center cursor-pointer transition">
                            <X className="h-4 w-4"/>
                          </button>
                        </div>
                      </CardContent>
                    </Card>) : (<Card className="border-white/10 bg-slate-950/65 backdrop-blur-xl h-full relative overflow-hidden">
                      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                        <div>
                          <CardTitle className="text-sm font-medium text-slate-400">{item.title}</CardTitle>
                          <CardDescription className="text-xs text-slate-500">
                            {budgetData?.monthly_budget
                            ? `Limit: $${Math.round(budgetData.monthly_budget).toLocaleString()}`
                            : "No limit set"}
                          </CardDescription>
                        </div>
                        <button onClick={() => {
                            setIsEditingBudget(true);
                            setNewBudgetAmount(budgetData?.monthly_budget ? budgetData.monthly_budget.toString() : "");
                        }} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400 hover:text-white p-1.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer flex items-center justify-center" title="Edit Budget Limit">
                          <Edit3 className="h-3.5 w-3.5"/>
                        </button>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl font-bold text-white tracking-tight">
                            {item.value}
                          </p>
                          {budgetData?.monthly_budget && (<span className={`flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${monthlyExpenses > budgetData.monthly_budget
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                              {Math.round((monthlyExpenses / budgetData.monthly_budget) * 100)}%
                            </span>)}
                        </div>

                        {/* Progress Bar */}
                        {budgetData?.monthly_budget ? (<div className="mt-3">
                            <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${monthlyExpenses > budgetData.monthly_budget
                                ? "bg-gradient-to-r from-rose-500 to-red-600"
                                : (monthlyExpenses / budgetData.monthly_budget) > 0.85
                                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                    : "bg-gradient-to-r from-cyan-400 to-emerald-400"}`} style={{ width: `${Math.min(100, (monthlyExpenses / budgetData.monthly_budget) * 100)}%` }}/>
                            </div>
                          </div>) : (<button onClick={() => {
                                setIsEditingBudget(true);
                                setNewBudgetAmount("");
                            }} className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline bg-transparent border-0 cursor-pointer">
                            Set budget limit
                          </button>)}
                      </CardContent>
                    </Card>)}
                </motion.div>);
            }
            return (<motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
                <Card className="border-white/10 bg-slate-950/65 backdrop-blur-xl h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">{item.title}</CardTitle>
                    <CardDescription className="text-xs text-slate-500">{item.detail}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold text-white tracking-tight">
                        {item.value}
                      </p>
                      <span className={`flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.change.startsWith("+")
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                        {item.change.startsWith("+") ? <ArrowUpRight className="h-3 w-3"/> : <ArrowDownRight className="h-3 w-3"/>}
                        {item.change}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>);
        })}
        </div>

        {/* Charts & Allocations */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Spend Category Bar Chart */}
          <Card className="border-white/10 bg-slate-950/65 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>
                    Highest expense channels for this account
                  </CardDescription>
                </div>
                <div className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs text-cyan-300 font-semibold uppercase tracking-wider">
                  Live Feed
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finalSpendingData}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }}/>
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }}/>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "1rem" }} itemStyle={{ color: "#ffffff" }}/>
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#22d3ee">
                      {finalSpendingData.map((_entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Allocation Pie Chart */}
          <Card className="border-white/10 bg-slate-950/65 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Portfolio plus cash and savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={finalAllocations} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={4}>
                      {finalAllocations.map((_entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "1rem" }} formatter={(value) => [`${value}%`, "Share"]}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {finalAllocations.map((item, index) => (<div key={item.name} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium text-white">
                      {item.value}%
                    </span>
                  </div>))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions & Milestones */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Live Recent Transactions */}
          <Card className="border-white/10 bg-slate-950/65 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>
                Latest cash flow across your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length > 0 ? (transactions.slice(0, 5).map((tx) => (<div key={tx.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <div>
                        <p className="font-medium text-white">
                          {tx.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {tx.category} · {tx.date}
                        </p>
                      </div>
                      <p className={`font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-slate-100"}`}>
                        {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>))) : (<div className="text-center py-6 text-slate-500">
                    No transactions recorded yet. Click "Add transaction" to begin.
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {/* Savings Goals */}
          <Card className="border-white/10 bg-slate-950/65 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Savings Goals</CardTitle>
                  <CardDescription>Track and contribute to your savings targets</CardDescription>
                </div>
                <Button onClick={() => setIsAddGoalOpen(true)} size="sm" className="rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/20 flex items-center justify-center cursor-pointer transition">
                  <Plus className="mr-1.5 h-3.5 w-3.5"/>
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {savings.length > 0 ? (savings.map((goal) => {
            const percent = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
            const isAchieved = goal.current_amount >= goal.target_amount;
            return (<div key={goal.id} className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-3 relative group/goal">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-xl p-2 ${isAchieved ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-300"}`}>
                            <PiggyBank className="h-5 w-5"/>
                          </div>
                          <div>
                            <p className="font-semibold text-white text-base">{goal.name}</p>
                            <p className="text-xs text-slate-400">
                              {goal.category} · Target: {goal.target_date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${isAchieved
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"}`}>
                            {percent}%
                          </span>
                          <button onClick={() => {
                    if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
                        deleteGoalMutation.mutate(goal.id);
                    }
                }} className="opacity-0 group-hover/goal:opacity-100 transition duration-200 text-slate-400 hover:text-red-400 p-1 rounded hover:bg-red-500/10 cursor-pointer" title="Delete Goal">
                            <Trash2 className="h-3.5 w-3.5"/>
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${isAchieved
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : "bg-gradient-to-r from-cyan-400 to-indigo-500"}`} style={{ width: `${percent}%` }}/>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>${goal.current_amount.toLocaleString()} saved</span>
                          <span>${goal.target_amount.toLocaleString()} target</span>
                        </div>
                      </div>

                      {/* Deposit Input & Button */}
                      {!isAchieved && (<div className="flex items-center gap-2 pt-1">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">$</span>
                            <input type="number" step="0.01" placeholder="Deposit amount" value={depositValues[goal.id] || ""} onChange={(e) => setDepositValues({
                        ...depositValues,
                        [goal.id]: e.target.value
                    })} className="w-full rounded-xl border border-white/5 bg-white/5 py-1.5 pl-7 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400/50 focus:bg-white/10"/>
                          </div>
                          <Button onClick={async () => {
                        const amountStr = depositValues[goal.id];
                        const amt = parseFloat(amountStr);
                        if (!isNaN(amt) && amt > 0) {
                            await addSavingsAmountMutation.mutateAsync({ goalId: goal.id, amount: amt });
                            setDepositValues({
                                ...depositValues,
                                [goal.id]: ""
                            });
                        }
                        else {
                            toast.error("Please enter a valid positive deposit amount");
                        }
                    }} disabled={addSavingsAmountMutation.isPending} size="sm" className="rounded-xl bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-semibold py-1.5 px-3 cursor-pointer">
                            Deposit
                          </Button>
                        </div>)}
                      
                      {isAchieved && (<p className="text-xs text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 rounded-xl py-1.5 text-center">
                          🎉 Goal completed! Excellent work saving for this goal.
                        </p>)}
                    </div>);
        })) : (<div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                  <PiggyBank className="h-10 w-10 text-slate-500 mx-auto mb-2"/>
                  <p className="text-sm text-slate-400 font-medium">No savings goals created yet</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Set up a target to begin automating your savings</p>
                  <Button onClick={() => setIsAddGoalOpen(true)} size="sm" className="rounded-xl bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-semibold cursor-pointer">
                    Create a Goal
                  </Button>
                </div>)}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} onSuccess={async (data) => {
            await addTxMutation.mutateAsync(data);
        }}/>

      {/* Add Savings Goal Modal */}
      <AddSavingsGoalModal isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} onSuccess={async (data) => {
            await addGoalMutation.mutateAsync(data);
        }}/>
    </Shell>);
}
