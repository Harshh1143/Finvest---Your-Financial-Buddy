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
import { formatCurrency, getCurrencySymbol, exchangeRates } from "../lib/currency";

export function LoansPage() {
    const { user } = useAuth();
    
    // Premium Custom Tooltip for the Debt Chart
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="rounded-xl border border-brand-cream/10 bg-brand-midnight-card px-4 py-3 shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-silver font-mono">{label}</p>
            <p className="mt-1.5 text-sm font-bold text-brand-cream font-mono">
              Projected: {formatCurrency(payload[0].value, user)}
            </p>
          </div>
        );
      }
      return null;
    };
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
        mutationFn: (newLoan) => {
            const userCurrency = user?.settings?.currency || 'USD';
            const rate = exchangeRates[userCurrency] || 1;
            const p = parseFloat(newLoan.principal) / rate;
            const r = parseFloat(newLoan.rate) / 12 / 100;
            const n = parseInt(newLoan.tenure_months);
            const emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            
            const start = new Date(newLoan.start_date);
            const nextPaymentDate = new Date(start.setMonth(start.getMonth() + 1)).toISOString().split("T")[0];
            
            const payload = {
                name: newLoan.name,
                principal: p,
                remaining: p,
                rate: parseFloat(newLoan.rate),
                tenureMonths: n,
                startDate: newLoan.start_date,
                nextPaymentDate,
                monthlyEMI: parseFloat(emi.toFixed(2))
            };
            return db.loans.add(user.id, payload);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
            toast.success(`Successfully tracked new loan: ${data.name}`);
        },
        onError: (err) => {
            toast.error("Failed to add loan: " + err.message);
        }
    });

    const payEMIMutation = useMutation({
        mutationFn: ({ loanId, extraPayment }) => {
            const userCurrency = user?.settings?.currency || 'USD';
            const rate = exchangeRates[userCurrency] || 1;
            const extraUSD = parseFloat(extraPayment || 0) / rate;
            return db.loans.payEMI(user.id, loanId, extraUSD);
        },
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
    const totalInterestPaid = useMemo(() => loans.reduce((sum, l) => sum + l.interestPaid, 0), [loans]);
    const totalPaid = useMemo(() => loans.reduce((sum, l) => sum + l.totalPaid, 0), [loans]);
    const totalMonthlyEMI = useMemo(() => loans.reduce((sum, l) => l.remaining > 0 ? sum + l.monthlyEMI : sum, 0), [loans]);

    const nextDueDate = useMemo(() => {
        const activeLoans = loans.filter((l) => l.remaining > 0 && l.nextPaymentDate);
        if (activeLoans.length === 0)
            return null;
        const sorted = [...activeLoans].sort((a, b) => {
            return new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
        });
        return sorted[0].nextPaymentDate;
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
            const amount = loans.reduce((sum, loan) => {
                if (loan.remaining > 0) {
                    return sum + loan.monthlyEMI;
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
                  <div className="absolute w-60 h-60 rounded-full bg-brand-cobalt/5 blur-[100px] animate-pulse" />
                  <div className="flex flex-col items-center gap-3 z-10">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-cobalt border-t-transparent" />
                    <span className="text-xs font-semibold tracking-[0.25em] text-brand-silver uppercase mt-4">
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
                <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-brand-cobalt/5 blur-[120px] pointer-events-none" />

                {/* Top Header */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
                    <div>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-1.5 w-1.5 rounded-full bg-brand-cobalt-light" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-silver font-mono">
                            Liability workspace
                          </p>
                        </div>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-cream">
                            Model debt with precision and clarity.
                        </h1>
                    </div>
                    <Button 
                        onClick={() => setIsAddLoanOpen(true)} 
                        className="w-fit bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold py-3.5 px-6 rounded-lg transition"
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
                                value: formatCurrency(totalRemaining, user),
                                color: "text-brand-cream",
                                icon: Landmark,
                                iconColor: "text-brand-silver bg-brand-cream/5 border-brand-cream/10",
                            },
                            {
                                label: "Original principal",
                                value: formatCurrency(totalPrincipal, user),
                                color: "text-brand-silver",
                                icon: Coins,
                                iconColor: "text-brand-silver bg-brand-cream/5 border-brand-cream/10",
                            },
                            {
                                label: "Total amount repaid",
                                value: formatCurrency(totalPaid, user),
                                color: "text-emerald-400",
                                icon: TrendingUp,
                                iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                            },
                            {
                                label: "Monthly EMI commitment",
                                value: formatCurrency(totalMonthlyEMI, user),
                                color: "text-brand-cobalt-light",
                                icon: ReceiptText,
                                iconColor: "text-brand-cobalt-light bg-brand-cobalt/10 border-brand-cobalt/20",
                            },
                        ].map((stat, idx) => {
                            const IconComponent = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                >
                                    <Card className="border-brand-cream/5 bg-brand-midnight-card/75 p-6 rounded-2xl border hover:border-brand-cobalt/35 transition-all duration-200 group relative overflow-hidden">
                                        <div className="flex items-center gap-3.5">
                                            <div className={`rounded-lg p-2.5 border ${stat.iconColor}`}>
                                                <IconComponent className="h-4 w-4" />
                                            </div>
                                            <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-brand-silver">
                                                {stat.label}
                                            </CardDescription>
                                        </div>
                                        <CardContent className="p-0 mt-5">
                                            <p className={`text-2xl font-bold tracking-tight font-mono ${stat.color}`}>{stat.value}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Main Content Area */}
                {loans.length === 0 ? (
                    <div className="mt-12 rounded-2xl border border-brand-cream/5 bg-brand-midnight-card/75 p-16 text-center relative overflow-hidden">
                        <Landmark className="mx-auto h-12 w-12 text-brand-silver animate-pulse" />
                        <h3 className="mt-6 text-lg font-bold text-brand-cream">No active loans</h3>
                        <p className="mt-2 text-xs text-brand-silver max-w-sm mx-auto">
                            You do not have any active loans tracked in your workspace. Start modeling your liability payoff plan today.
                        </p>
                        <Button 
                            onClick={() => setIsAddLoanOpen(true)} 
                            className="mt-8 bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold px-6 py-3.5 rounded-lg transition"
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
                                        key={loan._id} 
                                        initial={{ opacity: 0, y: 15 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="border-brand-cream/5 bg-brand-midnight-card/75 flex flex-col justify-between h-full relative overflow-hidden border hover:border-brand-cobalt/35 transition-all duration-200 group rounded-2xl">
                                            <CardHeader className="pb-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-brand-cream text-base font-bold group-hover:text-brand-cobalt-light transition duration-200">{loan.name}</CardTitle>
                                                        <CardDescription className="text-[10px] text-brand-silver mt-1 flex items-center gap-1.5 font-medium">
                                                            <span className="inline-block px-2 py-0.5 rounded-md bg-brand-cobalt/10 text-brand-cream border border-brand-cobalt/20 font-mono">{loan.rate}% APR</span>
                                                            <span>·</span>
                                                            <span className="font-mono">Next: {formatNextDue(loan.nextPaymentDate)}</span>
                                                        </CardDescription>
                                                    </div>
                                                    <button 
                                                        onClick={() => deleteLoanMutation.mutate(loan._id)} 
                                                        className="rounded-lg border border-brand-cream/10 p-2 text-brand-silver hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10 transition bg-brand-cream/5 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-5 pt-0">
                                                {/* Outstanding / EMI Header Box */}
                                                <div className="rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-4.5 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-brand-silver uppercase tracking-wider font-mono">Remaining Balance</p>
                                                        <p className="mt-1 text-xl font-bold text-brand-cream font-mono">
                                                            {formatCurrency(loan.remaining, user)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-brand-silver uppercase tracking-wider font-mono">Monthly EMI</p>
                                                        <p className="mt-1 text-base font-bold text-brand-cobalt-light font-mono">
                                                            {formatCurrency(loan.monthlyEMI, user)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Repayment Progress bar */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold text-brand-silver uppercase font-mono">
                                                        <span>Repayment progress</span>
                                                        <span className="text-brand-cobalt-light font-bold font-mono">{payoffProgress.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-brand-midnight rounded-full overflow-hidden border border-brand-cream/5">
                                                        <motion.div 
                                                            className="h-full bg-brand-cobalt rounded-full"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${payoffProgress}%` }}
                                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Metrics Details */}
                                                <div className="grid gap-3 grid-cols-2">
                                                    <div className="rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-3">
                                                        <p className="text-[9px] font-bold uppercase tracking-wider text-brand-silver font-mono">
                                                            Original Principal
                                                        </p>
                                                        <p className="mt-1 font-bold text-brand-cream text-xs font-mono">
                                                            {formatCurrency(loan.principal, user)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-3">
                                                        <p className="text-[9px] font-bold uppercase tracking-wider text-brand-silver font-mono">
                                                            Interest Paid
                                                        </p>
                                                        <p className="mt-1 font-bold text-brand-cream text-xs font-mono">
                                                            {formatCurrency(loan.interestPaid, user)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Payment Form Slide In */}
                                                <div className="pt-1">
                                                    <AnimatePresence mode="wait">
                                                        {payingLoanId === loan._id ? (
                                                            <motion.div 
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="space-y-3 rounded-xl border border-brand-cobalt/20 bg-brand-cobalt/5 p-4 overflow-hidden"
                                                            >
                                                                <p className="text-xs font-bold text-brand-cobalt-light flex items-center gap-1.5">
                                                                    <CreditCard className="h-3.5 w-3.5" />
                                                                    Make EMI Payment
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <input 
                                                                        type="number" 
                                                                        placeholder={`Extra prepayment (${getCurrencySymbol(user)})`} 
                                                                        value={extraPayment} 
                                                                        onChange={(e) => setExtraPayment(e.target.value)} 
                                                                        className="flex-1 rounded-lg border border-brand-cream/10 bg-brand-midnight px-3 py-2 text-xs text-brand-cream placeholder-brand-silver/30 outline-none focus:border-brand-cobalt transition font-mono"
                                                                    />
                                                                    <Button 
                                                                        onClick={() => handlePayEMI(loan._id)} 
                                                                        disabled={payEMIMutation.isPending} 
                                                                        size="sm" 
                                                                        className="bg-brand-cobalt text-brand-cream hover:bg-brand-cobalt-light font-bold text-xs py-2 px-3.5 rounded-lg cursor-pointer"
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
                                                                        className="text-xs py-2 px-3 border border-brand-cream/10 bg-brand-cream/5 hover:bg-brand-cream/10 text-brand-cream rounded-lg cursor-pointer"
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        ) : (
                                                            <Button 
                                                                onClick={() => {
                                                                    if (loan.remaining <= 0) return;
                                                                    setPayingLoanId(loan._id);
                                                                }} 
                                                                disabled={loan.remaining <= 0} 
                                                                className={`w-full justify-center border rounded-lg py-5 font-bold transition cursor-pointer ${
                                                                    loan.remaining <= 0 
                                                                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
                                                                        : "border-brand-cream/10 bg-brand-cream/5 hover:bg-brand-cream/10 text-brand-cream"
                                                                }`}
                                                            >
                                                                {loan.remaining <= 0 ? (
                                                                    <>
                                                                        <ShieldCheck className="mr-2 h-4 w-4 text-emerald-400"/>
                                                                        Fully Repaid
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Coins className="mr-2 h-4 w-4 text-brand-cobalt-light"/>
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
                            <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl border overflow-hidden relative">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-brand-cream text-base font-bold flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-brand-cobalt-light stroke-[2.5]" />
                                        Payment outlook
                                    </CardTitle>
                                    <CardDescription className="text-brand-silver text-xs">
                                        Projected monthly payment commitment over the next 6 months
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={schedule} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#2b5cb8" stopOpacity={0.8}/>
                                                        <stop offset="100%" stopColor="#4477d6" stopOpacity={0.15}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} stroke="rgba(251,250,247,0.03)"/>
                                                <XAxis 
                                                    dataKey="month" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: "#8c9cb3", fontSize: 10, fontWeight: 500 }}
                                                />                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: "#8c9cb3", fontSize: 10, fontWeight: 500, fontFamily: "var(--font-mono)" }}
                                                    tickFormatter={(v) => `${getCurrencySymbol(user)}${v.toLocaleString()}`}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar 
                                                    dataKey="amount" 
                                                    radius={[4, 4, 0, 0]} 
                                                    fill="url(#barGradient)"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
 
                            {/* Repayment Health Details */}
                            <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl border overflow-hidden relative flex flex-col justify-between">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-brand-cream text-base font-bold flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-emerald-400 stroke-[2.5]" />
                                        Repayment health
                                    </CardTitle>
                                    <CardDescription className="text-brand-silver text-xs">
                                        Cumulative debt payoff metrics and projections
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        ["Total principal", formatCurrency(totalPrincipal, user)],
                                        ["Total remaining", formatCurrency(totalRemaining, user)],
                                        ["Total paid off", formatCurrency(totalPaid, user)],
                                        ["Total interest paid", formatCurrency(totalInterestPaid, user)],
                                        ["Next payment due", formatNextDue(nextDueDate)],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between rounded-xl border border-brand-cream/5 bg-brand-cream/5 px-4.5 py-3.5 hover:border-brand-cobalt/20 transition-all duration-200">
                                            <span className="text-xs font-semibold text-brand-silver">{label}</span>
                                            <span className="font-bold text-brand-cream text-xs font-mono">{value}</span>
                                        </div>
                                    ))}
                                    
                                    {totalPaid > 0 && totalPrincipal > 0 && (
                                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-xs text-emerald-200 mt-2 font-mono">
                                            <div className="flex items-start gap-3">
                                                <TrendingUp className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0 mt-0.5"/>
                                                <p className="leading-relaxed">
                                                    You have successfully paid off <strong className="font-bold text-brand-cream">{Math.round((totalPaid / totalPrincipal) * 100)}%</strong> of your combined original debt principal. Keep it up!
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
