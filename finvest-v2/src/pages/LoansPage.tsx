import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Landmark, ReceiptText, TrendingUp, Trash2, Coins } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Shell } from "../components/layout/shell";
import { db } from "../lib/db";
import { useAuth } from "../components/providers/auth-provider";
import { AddLoanModal } from "../components/modals/AddLoanModal";

const COLORS = ["#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#f43f5e"];

export function LoansPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [payingLoanId, setPayingLoanId] = useState<number | null>(null);
  const [extraPayment, setExtraPayment] = useState<string>("");

  // Queries
  const { data: loans = [], isLoading } = useQuery({
    queryKey: ["loans", user?.id],
    queryFn: () => db.loans.list(user!.id),
    enabled: !!user?.id,
  });

  // Mutations
  const addLoanMutation = useMutation({
    mutationFn: (newLoan: any) => db.loans.add(user!.id, newLoan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
    },
  });

  const payEMIMutation = useMutation({
    mutationFn: ({ loanId, extraPayment }: { loanId: number; extraPayment: number }) =>
      db.loans.payEMI(user!.id, loanId, extraPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
      setPayingLoanId(null);
      setExtraPayment("");
    },
  });

  const deleteLoanMutation = useMutation({
    mutationFn: (loanId: number) => db.loans.delete(user!.id, loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans", user?.id] });
    },
  });

  // Calculations
  const totalPrincipal = useMemo(() => loans.reduce((sum, l) => sum + l.principal, 0), [loans]);
  const totalRemaining = useMemo(() => loans.reduce((sum, l) => sum + l.remaining, 0), [loans]);
  const totalInterestPaid = useMemo(() => loans.reduce((sum, l) => sum + l.interest_paid, 0), [loans]);
  const totalPaid = useMemo(() => loans.reduce((sum, l) => sum + l.total_paid, 0), [loans]);

  const nextDueDate = useMemo(() => {
    const activeLoans = loans.filter((l) => l.remaining > 0 && l.next_payment_date);
    if (activeLoans.length === 0) return null;
    
    // Sort to find the earliest next payment date
    const sorted = [...activeLoans].sort((a, b) => {
      return new Date(a.next_payment_date!).getTime() - new Date(b.next_payment_date!).getTime();
    });
    return sorted[0].next_payment_date;
  }, [loans]);

  const formatNextDue = (dateStr: string | null) => {
    if (!dateStr) return "None due";
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

  const handlePayEMI = async (loanId: number) => {
    const extra = parseFloat(extraPayment) || 0;
    await payEMIMutation.mutateAsync({ loanId, extraPayment: extra });
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
            <span className="text-sm text-slate-400">Loading liabilities...</span>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-cyan-300">Loan management</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Model debt with precision and clarity.
            </h1>
          </div>
          <Button onClick={() => setIsAddLoanOpen(true)} className="w-fit py-5 rounded-2xl font-semibold bg-cyan-400 hover:bg-cyan-500 text-slate-950">
            <ReceiptText className="mr-2 h-4 w-4" />
            Add loan
          </Button>
        </div>

        {loans.length === 0 ? (
          <div className="mt-12 rounded-[2rem] border border-white/10 bg-slate-950/40 p-12 text-center">
            <Landmark className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-4 text-lg font-semibold text-white">No active loans</h3>
            <p className="mt-2 text-sm text-slate-400">
              You do not have any active loans tracked in your workspace.
            </p>
            <Button onClick={() => setIsAddLoanOpen(true)} className="mt-6 bg-cyan-400 hover:bg-cyan-500 text-slate-950 rounded-xl">
              Add Your First Loan
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loans.map((loan) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="border-white/10 bg-slate-950/65 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg font-bold">{loan.name}</CardTitle>
                        <CardDescription className="text-xs text-slate-400 mt-1">
                          {loan.rate}% APR · next payment {formatNextDue(loan.next_payment_date)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => deleteLoanMutation.mutate(loan.id)}
                          className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-red-400 transition bg-white/5 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Remaining balance</p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          ${loan.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">Monthly EMI</p>
                        <p className="mt-1 text-lg font-semibold text-cyan-300">
                          ${loan.monthly_emi.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-3 grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Principal
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          ${loan.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Interest paid
                        </p>
                        <p className="mt-1 font-semibold text-white">
                          ${loan.interest_paid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      {payingLoanId === loan.id ? (
                        <div className="space-y-2 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3">
                          <p className="text-xs font-medium text-cyan-300">Make EMI Payment</p>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Extra prepayment ($)"
                              value={extraPayment}
                              onChange={(e) => setExtraPayment(e.target.value)}
                              className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                            />
                            <Button
                              onClick={() => handlePayEMI(loan.id)}
                              disabled={payEMIMutation.isPending}
                              size="sm"
                              className="bg-cyan-400 hover:bg-cyan-500 text-slate-950 text-xs py-1"
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
                              className="text-xs py-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            if (loan.remaining <= 0) return;
                            setPayingLoanId(loan.id);
                          }}
                          disabled={loan.remaining <= 0}
                          className="w-full justify-center bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl"
                        >
                          <Coins className="mr-2 h-4 w-4 text-cyan-300" />
                          {loan.remaining <= 0 ? "Fully Repaid" : "Pay Monthly EMI"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {loans.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <Card className="border-white/10 bg-slate-950/65">
              <CardHeader>
                <CardTitle>Payment outlook</CardTitle>
                <CardDescription>
                  Projected monthly payment commitment over the next 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={schedule}>
                      <CartesianGrid
                        vertical={false}
                        stroke="rgba(255,255,255,0.06)"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "1rem" }}
                        itemStyle={{ color: "#ffffff" }}
                      />
                      <Bar
                        dataKey="amount"
                        radius={[10, 10, 0, 0]}
                        fill="#a78bfa"
                      >
                        {schedule.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-950/65">
              <CardHeader>
                <CardTitle>Repayment health</CardTitle>
                <CardDescription>
                  Cumulative debt payoff metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  ["Total principal", `$${Math.round(totalPrincipal).toLocaleString()}`],
                  ["Total remaining", `$${Math.round(totalRemaining).toLocaleString()}`],
                  ["Total paid off", `$${Math.round(totalPaid).toLocaleString()}`],
                  ["Total interest paid", `$${Math.round(totalInterestPaid).toLocaleString()}`],
                  ["Next payment due", formatNextDue(nextDueDate)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="text-slate-300">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
                {totalPaid > 0 && totalPrincipal > 0 && (
                  <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      You have successfully paid off {Math.round((totalPaid / totalPrincipal) * 100)}% of your combined original debt principal.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
