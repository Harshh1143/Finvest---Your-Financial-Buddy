import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Landmark, ReceiptText, TrendingUp, Trash2, Coins, Calendar, Percent, 
  Plus, X, ShieldCheck, Activity, CreditCard, ChevronRight, AlertCircle
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell, } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Shell } from "../components/layout/shell";
import { db } from "../lib/db";
import { useAuth } from "../components/providers/auth-provider";
import { AddLoanModal } from "../components/modals/AddLoanModal";
import { toast } from "sonner";

// Premium Custom Tooltip for the Debt Chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur-md shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</p>
        <p className="mt-1.5 text-base font-bold text-white">
          Projected: ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export function LoansPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
    const [payingLoanId, setPayingLoanId] = useState(null);
    const [extraPayment, setExtraPayment] = useState("");

    // Queries
    const { data: loans = [], isLoading } = useQuery({
        queryKey: ["loans", user?.id],
        queryFn: () => db.loans.list(user.id),
        enabled: !!user?.id,
    });

    // Mutations
    const addLoanMutation = useMutation({
        mutationFn: (newLoan) => db.loans.add(user.id, newLoan),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
            toast.success(`Successfully tracked new loan: ${data.name}`);
        },
        onError: (err) => {
            toast.error("Failed to add loan: " + err.message);
        }
    });

    const payEMIMutation = useMutation({
        mutationFn: ({ loanId, extraPayment }) => db.loans.payEMI(user.id, loanId, extraPayment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
            setPayingLoanId(null);
            setExtraPayment("");
            toast.success(`Monthly EMI repayment recorded successfully!`);
        },
        onError: (err) => {
            toast.error("Failed to record repayment: " + err.message);
        }
    });

    const deleteLoanMutation = useMutation({
        mutationFn: (loanId) => db.loans.delete(user.id, loanId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
            toast.success("Loan tracked liability removed successfully.");
        },
        onError: (err) => {
            toast.error("Failed to delete loan: " + err.message);
        }
    });

    // Calculations
    const totalPrincipal = useMemo(() => loans.reduce((sum, l) => sum + l.principal, 0), [loans]);
    const totalRemaining = useMemo(() => loans.reduce((sum, l) => sum + l.remaining, 0), [loans]);
    const totalInterestPaid = useMemo(() => loans.reduce((sum, l) => sum + l.interest_paid, 0), [loans]);
    const totalPaid = useMemo(() => loans.reduce((sum, l) => sum + l.total_paid, 0), [loans]);
    const totalMonthlyEMI = useMemo(() => loans.reduce((sum, l) => l.remaining > 0 ? sum + l.monthly_emi : sum, 0), [loans]);

    const nextDueDate = useMemo(() => {
        const activeLoans = loans.filter((l) => l.remaining > 0 && l.next_payment_date);
        if (activeLoans.length === 0)
            return null;
        // Sort to find the earliest next payment date
        const sorted = [...activeLoans].sort((a, b) => {
            return new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime();
        });
        return sorted[0].next_payment_date;
    }, [loans]);

    const formatNextDue = (dateStr) => {
        if (!dateStr)
            return "None due";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const schedule = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const result = [];
        const currentDate = new Date();
        for (let i = 0; i < 6; i++) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
            const monthName = months[d.getMonth()];
            // Sum EMIs of all active loans for this projected month
            const amount = loans.reduce((sum, loan) => {
                if (loan.remaining > 0) {
                    return sum + loan.monthly_emi;
                }
                return sum;
            }, 0);
            result.push({
                month: `${monthName} '${d.getFullYear().toString().substring(2)}`,
                amount: parseFloat(amount.toFixed(2)),
            });
        }
        return result;
    }, [loans]);

    const handlePayEMI = async (loanId) => {
        const extra = parseFloat(extraPayment) || 0;
        await payEMIMutation.mutateAsync({ loanId, extraPayment: extra });
    };

    if (isLoading) {
        return (
            <Shell>
                <div className="flex h-[60vh] items-center justify-center relative">
                    <div className="absolute w-60 h-60 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
                    <div className="flex flex-col items-center gap-3 z-10">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
                        <span className="text-xs font-semibold tracking-[0.25em] text-cyan-300 uppercase mt-4">
                            Loading liability workspace...
                        </span>
                    </div>
                </div>
            </Shell>
        );
    }

    return (
        <Shell>
            <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 relative min-h-screen">
                {/* Glow Spheres */}
                <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
                <div className="absolute top-[30rem] right-10 w-96 h-96 rounded-full bg-violet-500/5 blur-[150px] pointer-events-none" />

                {/* Top Header */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            <p className="text-xs font-semibold tracking-[0.2em] text-cyan-300 uppercase">
                                Liability workspace
                            </p>
                        </div>
                        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
                            Model debt with precision and clarity.
                        </h1>
                    </div>
                    <Button 
                        onClick={() => setIsAddLoanOpen(true)} 
                        className="w-fit py-6 px-6 rounded-2xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-500 hover:to-cyan-500 text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    >
                        <Plus className="mr-2 h-4 w-4 stroke-[2.5]" />
                        Add loan
                    </Button>
                </div>

                {/* KPI Section */}
                {loans.length > 0 && (
                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
                        {[
                            {
                                label: "Total outstanding balance",
                                value: `$${totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                color: "text-white",
                                icon: Landmark,
                                iconColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
                            },
                            {
                                label: "Original principal",
                                value: `$${totalPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                color: "text-slate-300",
                                icon: Coins,
                                iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                            },
                            {
                                label: "Total amount repaid",
                                value: `$${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                color: "text-emerald-400",
                                icon: TrendingUp,
                                iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                            },
                            {
                                label: "Monthly EMI commitment",
                                value: `$${totalMonthlyEMI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                color: "text-cyan-300",
                                icon: ReceiptText,
                                iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                            },
                        ].map((stat, idx) => {
                            const IconComponent = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                                >
                                    <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl p-6 rounded-[2rem] border-[1px] hover:border-cyan-500/25 transition-all duration-300 group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                        <div className="flex items-center gap-3.5">
                                            <div className={`rounded-xl p-2.5 border-[1px] ${stat.iconColor}`}>
                                                <IconComponent className="h-4 w-4" />
                                            </div>
                                            <CardDescription className="text-xs uppercase tracking-[0.12em] font-semibold text-slate-500">
                                                {stat.label}
                                            </CardDescription>
                                        </div>
                                        <CardContent className="p-0 mt-5">
                                            <p className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Main Content Area */}
                {loans.length === 0 ? (
                    <div className="mt-12 rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-2xl p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none"/>
                        <Landmark className="mx-auto h-14 w-14 text-slate-600 animate-float" />
                        <h3 className="mt-6 text-xl font-extrabold text-white">No active loans</h3>
                        <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
                            You do not have any active loans tracked in your workspace. Start modeling your liability payoff plan today.
                        </p>
                        <Button 
                            onClick={() => setIsAddLoanOpen(true)} 
                            className="mt-8 bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-500 hover:to-cyan-500 text-slate-950 font-bold px-8 py-5 rounded-2xl shadow-[0_10px_25px_rgba(34,211,238,0.2)] transition duration-300"
                        >
                            Add Your First Loan
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mt-10 grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 relative z-10">
                            {loans.map((loan) => {
                                const payoffProgress = loan.principal > 0 ? ((loan.principal - loan.remaining) / loan.principal) * 100 : 0;
                                return (
                                    <motion.div 
                                        key={loan.id} 
                                        initial={{ opacity: 0, y: 16 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl flex flex-col justify-between h-full relative overflow-hidden border-[1px] hover:border-cyan-500/25 transition-all duration-300 group rounded-[2rem]">
                                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none"/>
                                            <CardHeader className="pb-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-white text-lg font-bold group-hover:text-cyan-300 transition duration-300">{loan.name}</CardTitle>
                                                        <CardDescription className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                                                            <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{loan.rate}% APR</span>
                                                            <span>·</span>
                                                            <span>Next: {formatNextDue(loan.next_payment_date)}</span>
                                                        </CardDescription>
                                                    </div>
                                                    <button 
                                                        onClick={() => deleteLoanMutation.mutate(loan.id)} 
                                                        className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10 transition bg-white/5 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-5 pt-0">
                                                {/* Outstanding / EMI Header Box */}
                                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Remaining Balance</p>
                                                        <p className="mt-1 text-2xl font-black text-white">
                                                            ${loan.remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Monthly EMI</p>
                                                        <p className="mt-1 text-lg font-bold text-cyan-300">
                                                            ${loan.monthly_emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Repayment Progress bar */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                                                        <span>Repayment progress</span>
                                                        <span className="text-cyan-300 font-bold">{payoffProgress.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <motion.div 
                                                            className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500 rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${payoffProgress}%` }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Metrics Details */}
                                                <div className="grid gap-3 grid-cols-2">
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                                            Original Principal
                                                        </p>
                                                        <p className="mt-1 font-bold text-white text-sm">
                                                            ${loan.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                                            Interest Paid
                                                        </p>
                                                        <p className="mt-1 font-bold text-white text-sm">
                                                            ${loan.interest_paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Payment Form Slide In */}
                                                <div className="pt-1">
                                                    <AnimatePresence mode="wait">
                                                        {payingLoanId === loan.id ? (
                                                            <motion.div 
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="space-y-3 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 overflow-hidden"
                                                            >
                                                                <p className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                                                                    <CreditCard className="h-3.5 w-3.5" />
                                                                    Make EMI Payment
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <input 
                                                                        type="number" 
                                                                        placeholder="Extra prepayment ($)" 
                                                                        value={extraPayment} 
                                                                        onChange={(e) => setExtraPayment(e.target.value)} 
                                                                        className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition duration-300"
                                                                    />
                                                                    <Button 
                                                                        onClick={() => handlePayEMI(loan.id)} 
                                                                        disabled={payEMIMutation.isPending} 
                                                                        size="sm" 
                                                                        className="bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-500 hover:to-cyan-500 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-xl cursor-pointer"
                                                                    >
                                                                        Confirm
                                                                    </Button>
                                                                    <Button 
                                                                        onClick={() => {
                                                                            setPayingLoanId(null);
                                                                            setExtraPayment("");
                                                                        }} 
                                                                        variant="secondary" 
                                                                        size="sm" 
                                                                        className="text-xs py-2 px-3 border border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-xl cursor-pointer"
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        ) : (
                                                            <Button 
                                                                onClick={() => {
                                                                    if (loan.remaining <= 0) return;
                                                                    setPayingLoanId(loan.id);
                                                                }} 
                                                                disabled={loan.remaining <= 0} 
                                                                className={`w-full justify-center border rounded-xl py-5 font-bold transition duration-300 cursor-pointer ${
                                                                    loan.remaining <= 0 
                                                                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
                                                                        : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                                                                }`}
                                                            >
                                                                {loan.remaining <= 0 ? (
                                                                    <>
                                                                        <ShieldCheck className="mr-2 h-4 w-4 text-emerald-400"/>
                                                                        Fully Repaid
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Coins className="mr-2 h-4 w-4 text-cyan-300"/>
                                                                        Pay Monthly EMI
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Chart & Health Analytics Section */}
                        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] relative z-10">
                            {/* Payment Outlook Chart */}
                            <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2rem] border-[1px] overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-cyan-400 stroke-[2.5]" />
                                        Payment outlook
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Projected monthly payment commitment over the next 6 months
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={schedule} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.85}/>
                                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.2}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)"/>
                                                <XAxis 
                                                    dataKey="month" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                                                    tickFormatter={(v) => `$${Math.round(v).toLocaleString()}`}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar 
                                                    dataKey="amount" 
                                                    radius={[10, 10, 0, 0]} 
                                                    fill="url(#barGradient)"
                                                    activeBar={{ fill: "#c084fc", stroke: "#fff", strokeWidth: 1 }}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Repayment Health Details */}
                            <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2rem] border-[1px] overflow-hidden relative flex flex-col justify-between">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-emerald-400 stroke-[2.5]" />
                                        Repayment health
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Cumulative debt payoff metrics and projections
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        ["Total principal", `$${totalPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                                        ["Total remaining", `$${totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                                        ["Total paid off", `$${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                                        ["Total interest paid", `$${totalInterestPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                                        ["Next payment due", formatNextDue(nextDueDate)],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4.5 py-3.5 hover:bg-white/10 transition-all duration-300">
                                            <span className="text-sm font-semibold text-slate-400">{label}</span>
                                            <span className="font-bold text-white text-sm">{value}</span>
                                        </div>
                                    ))}
                                    
                                    {totalPaid > 0 && totalPrincipal > 0 && (
                                        <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-5 text-xs text-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.05)] mt-2">
                                            <div className="flex items-start gap-3">
                                                <TrendingUp className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0 mt-0.5"/>
                                                <p className="leading-relaxed">
                                                    You have successfully paid off <strong className="font-extrabold text-white">{Math.round((totalPaid / totalPrincipal) * 100)}%</strong> of your combined original debt principal. Keep it up!
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>

            <AddLoanModal 
                isOpen={isAddLoanOpen} 
                onClose={() => setIsAddLoanOpen(false)} 
                onSuccess={async (data) => {
                    await addLoanMutation.mutateAsync(data);
                }}
            />
        </Shell>
    );
}

