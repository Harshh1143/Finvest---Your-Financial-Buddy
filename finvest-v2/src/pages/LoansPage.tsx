import { motion } from "framer-motion";
import { Landmark, ReceiptText, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
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

const loans = [
  {
    name: "Home loan",
    principal: 320000,
    remaining: 248000,
    rate: 6.5,
    nextPayment: "Aug 15",
    totalPaid: 72000,
    interestPaid: 24000,
  },
  {
    name: "Education loan",
    principal: 64000,
    remaining: 41200,
    rate: 5.2,
    nextPayment: "Aug 22",
    totalPaid: 22800,
    interestPaid: 8600,
  },
];

const schedule = [
  { month: "Jan", amount: 2200 },
  { month: "Feb", amount: 2150 },
  { month: "Mar", amount: 2080 },
  { month: "Apr", amount: 2210 },
];

export function LoansPage() {
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
          <Button className="w-fit">
            <ReceiptText className="mr-2 h-4 w-4" />
            Add loan
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loans.map((loan) => (
            <motion.div
              key={loan.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-white/10 bg-slate-950/65">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{loan.name}</CardTitle>
                    <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-300">
                      <Landmark className="h-4 w-4" />
                    </div>
                  </div>
                  <CardDescription>
                    {loan.rate}% APR · next payment {loan.nextPayment}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Remaining balance</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      ${loan.remaining.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Principal
                      </p>
                      <p className="mt-2 font-semibold text-white">
                        ${loan.principal.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Interest paid
                      </p>
                      <p className="mt-2 font-semibold text-white">
                        ${loan.interestPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <CardTitle>Payment outlook</CardTitle>
              <CardDescription>
                Monthly payment rhythm over time
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
                    <Tooltip />
                    <Bar
                      dataKey="amount"
                      radius={[10, 10, 0, 0]}
                      fill="#a78bfa"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <CardTitle>Repayment health</CardTitle>
              <CardDescription>
                Principal and interest performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Total paid", "$95,800"],
                ["Interest paid", "$32,600"],
                ["Next due", "Aug 15"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-slate-300">{label}</span>
                  <span className="font-semibold text-white">{value}</span>
                </div>
              ))}
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ahead of pace by 6.2% on your preferred repayment plan.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
