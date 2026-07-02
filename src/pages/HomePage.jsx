import { motion } from "framer-motion";
import { BrainCircuit, CheckCircle2, ChevronRight, ShieldCheck, Sparkles, TrendingUp, } from "lucide-react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, } from "recharts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../components/ui/card";
import { Shell } from "../components/layout/shell";
const metrics = [
    { label: "Net worth", value: "$184.2K", change: "+12.4%" },
    { label: "Savings rate", value: "27.8%", change: "+3.1%" },
    { label: "Automation", value: "89%", change: "+8%" },
];
const chartData = [
    { month: "Jan", value: 42 },
    { month: "Feb", value: 58 },
    { month: "Mar", value: 49 },
    { month: "Apr", value: 74 },
    { month: "May", value: 81 },
    { month: "Jun", value: 97 },
];
const features = [
    {
        title: "Live cash flow intelligence",
        description: "See every inflow and outflow in one calm, gorgeous workspace.",
        icon: BrainCircuit,
    },
    {
        title: "Goal-driven planning",
        description: "Model large milestones and keep momentum visible with smart projections.",
        icon: TrendingUp,
    },
    {
        title: "Bank-grade trust",
        description: "Your data stays protected with encryption by default and audit-friendly controls.",
        icon: ShieldCheck,
    },
];
const testimonials = [
    {
        quote: "Finvest made my finances feel elegant and actionable overnight.",
        name: "Maya Chen",
        role: "Founder, Northstar Labs",
    },
    {
        quote: "The product feels like Stripe and Mercury had a child with Notion.",
        name: "Owen Patel",
        role: "Product Lead, Northline",
    },
];
export function HomePage() {
    return (<Shell>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
            <Sparkles className="h-4 w-4"/>
            The premium operating system for modern money
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Finances that feel calm, beautiful, and in control.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Replace spreadsheets with a polished workspace for budgets,
              investments, loans, and every decision that moves your money
              forward.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/dashboard">Launch dashboard</Link>
            </Button>
            <Button variant="outline" size="lg">
              View live preview
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 pt-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400"/> Unified
              portfolio tracking
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400"/> Smart
              forecasts and alerts
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/30 via-transparent to-violet-500/20 blur-3xl"/>
          <Card className="relative overflow-hidden border-white/10 bg-slate-950/70 p-4">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm text-slate-400">Portfolio pulse</p>
                <p className="text-xl font-semibold text-white">
                  +$12,840 this month
                </p>
              </div>
              <div className="rounded-full bg-emerald-500/15 p-2 text-emerald-300">
                <TrendingUp className="h-5 w-5"/>
              </div>
            </div>
            <div className="h-56 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.03}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)"/>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }}/>
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#38bdf8" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (<div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {metric.value}
                  </p>
                  <p className="text-sm text-emerald-400">{metric.change}</p>
                </div>))}
            </div>
          </Card>
        </motion.div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (<motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35, delay: index * 0.08 }}>
                <Card className="h-full border-white/10 bg-slate-950/55">
                  <CardHeader>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                      <Icon className="h-5 w-5"/>
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>);
        })}
        </div>
      </section>

      <section id="insights" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-300">Cash flow overview</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  A living dashboard for every decision.
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-400">
                Updated live
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {[
            ["Income", "$9,480", "+8.2%"],
            ["Expenses", "$6,120", "-2.1%"],
            ["Investments", "$2,130", "+14.4%"],
        ].map(([label, value, change]) => (<div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-slate-300">{label}</span>
                  <div className="text-right">
                    <p className="font-semibold text-white">{value}</p>
                    <p className="text-sm text-emerald-400">{change}</p>
                  </div>
                </div>))}
            </div>
          </Card>
          <Card className="border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-300">Thermal performance</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  One view for money, planning, and momentum.
                </h2>
              </div>
            </div>
            <div className="mt-6 h-72 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/70 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)"/>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }}/>
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#a78bfa" fillOpacity={1} fill="rgba(167,139,250,0.2)" strokeWidth={3}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-cyan-950/60 p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Built for ambitious households
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Premium clarity for every financial chapter.
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                From budgeting to investing, Finvest brings strategy and
                elegance together in one polished workspace.
              </p>
            </div>
            <Button size="lg" className="w-fit">
              Start free <ChevronRight className="ml-2 h-4 w-4"/>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {testimonials.map((item) => (<Card key={item.name} className="border-white/10 bg-white/5">
                <CardContent className="pt-6">
                  <p className="text-lg leading-8 text-slate-200">
                    “{item.quote}”
                  </p>
                  <div className="mt-4">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">{item.role}</p>
                  </div>
                </CardContent>
              </Card>))}
          </div>
        </div>
      </section>
    </Shell>);
}
