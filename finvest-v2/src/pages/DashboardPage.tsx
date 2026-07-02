import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  CalendarClock,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
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

const summary = [
  {
    title: "Net worth",
    value: "$184,320",
    change: "+12.4%",
    detail: "vs last month",
  },
  {
    title: "Monthly spend",
    value: "$7,240",
    change: "-3.2%",
    detail: "within target",
  },
  {
    title: "Savings",
    value: "$22,410",
    change: "+4.8%",
    detail: "automatic transfers",
  },
  {
    title: "Investments",
    value: "$58,900",
    change: "+9.1%",
    detail: "portfolio growth",
  },
];

const spending = [
  { name: "Housing", value: 3200 },
  { name: "Food", value: 1280 },
  { name: "Travel", value: 920 },
  { name: "Lifestyle", value: 840 },
];

const allocations = [
  { name: "Cash", value: 38 },
  { name: "Equities", value: 42 },
  { name: "Bonds", value: 20 },
];

const transactions = [
  {
    merchant: "Northstar",
    amount: "-$184",
    category: "Software",
    date: "Today",
  },
  {
    merchant: "Salary",
    amount: "+$4,200",
    category: "Income",
    date: "Yesterday",
  },
  {
    merchant: "Arcadia",
    amount: "-$92",
    category: "Dining",
    date: "2 days ago",
  },
];

const COLORS = ["#38bdf8", "#a78bfa", "#34d399"];

export function DashboardPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-cyan-300">Financial overview</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Your money, beautifully organized.
            </h1>
          </div>
          <Button className="w-fit">
            <BadgeDollarSign className="mr-2 h-4 w-4" />
            Add transaction
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-white/10 bg-slate-950/65">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-semibold text-white">
                      {item.value}
                    </p>
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-400">
                      {item.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly performance</CardTitle>
                  <CardDescription>
                    Income vs expenses over the last 6 months
                  </CardDescription>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-400">
                  Live
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spending}>
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <XAxis
                      dataKey="name"
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
                      dataKey="value"
                      radius={[12, 12, 0, 0]}
                      fill="#38bdf8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <CardTitle>Allocation</CardTitle>
              <CardDescription>Current risk-adjusted mix</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocations}
                      dataKey="value"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {allocations.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {allocations.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
                  >
                    <span>{item.name}</span>
                    <span className="font-medium text-white">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>
                Latest movement across your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.merchant}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {transaction.merchant}
                      </p>
                      <p className="text-sm text-slate-400">
                        {transaction.category} · {transaction.date}
                      </p>
                    </div>
                    <p
                      className={`font-semibold ${transaction.amount.startsWith("+") ? "text-emerald-400" : "text-slate-100"}`}
                    >
                      {transaction.amount}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <CardTitle>Next milestones</CardTitle>
              <CardDescription>Budget, goal, and plan health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  icon: Wallet,
                  label: "Emergency fund",
                  value: "76%",
                  hint: "On track",
                },
                {
                  icon: PiggyBank,
                  label: "Trip fund",
                  value: "54%",
                  hint: "2 months left",
                },
                {
                  icon: CalendarClock,
                  label: "Tax reserve",
                  value: "82%",
                  hint: "Prepared",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.label}</p>
                          <p className="text-sm text-slate-400">{item.hint}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <TrendingUp className="h-4 w-4" />
                        {item.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
