import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Shell } from "../components/layout/shell";

const fallbackSeries = [
  { day: "Mon", value: 118 },
  { day: "Tue", value: 122 },
  { day: "Wed", value: 124 },
  { day: "Thu", value: 121 },
  { day: "Fri", value: 128 },
  { day: "Sat", value: 131 },
  { day: "Sun", value: 135 },
];

const sampleTickers = ["AAPL", "MSFT", "NVDA", "TSLA", "AMD"];

export function PortfolioPage() {
  const [query, setQuery] = useState("AAPL");
  const [selected, setSelected] = useState(sampleTickers[0]);
  const [useManualPrice, setUseManualPrice] = useState(false);

  const chartData = useMemo(() => fallbackSeries, []);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-cyan-300">Investment workspace</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Track, price, and grow your portfolio.
            </h1>
          </div>
          <Button className="w-fit">
            <Sparkles className="mr-2 h-4 w-4" />
            Auto-refresh prices
          </Button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <CardTitle>Live stock search</CardTitle>
              <CardDescription>
                Search by company name or ticker and layer in your position.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                <Search className="h-4 w-4 text-cyan-300" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                  placeholder="Search AAPL, Microsoft..."
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {sampleTickers.map((ticker) => (
                  <button
                    key={ticker}
                    type="button"
                    onClick={() => setSelected(ticker)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${selected === ticker ? "border-cyan-400/40 bg-cyan-500/10 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
                  >
                    <p className="font-semibold">{ticker}</p>
                    <p className="text-sm text-slate-400">
                      {ticker === "AAPL" ? "Apple Inc." : "Market leader"}
                    </p>
                  </button>
                ))}
              </div>
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/70 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Selected company</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {selected}
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-400">
                    Live price
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Exchange
                    </p>
                    <p className="mt-2 font-medium text-white">NASDAQ</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Price
                    </p>
                    <p className="mt-2 font-medium text-white">$214.83</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Day change
                    </p>
                    <p className="mt-2 font-medium text-emerald-400">+1.84%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <CardTitle>Position details</CardTitle>
              <CardDescription>
                Calculate return metrics from a live or manual price.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
                <button
                  type="button"
                  className={`rounded-full px-3 py-2 ${!useManualPrice ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400"}`}
                  onClick={() => setUseManualPrice(false)}
                >
                  Auto price
                </button>
                <button
                  type="button"
                  className={`rounded-full px-3 py-2 ${useManualPrice ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400"}`}
                  onClick={() => setUseManualPrice(true)}
                >
                  Manual price
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-slate-400">
                  <span className="mb-2 block">Quantity</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none"
                    defaultValue="12"
                  />
                </label>
                <label className="text-sm text-slate-400">
                  <span className="mb-2 block">Purchase date</span>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none"
                    defaultValue="2024-01-16"
                  />
                </label>
              </div>
              <label className="text-sm text-slate-400">
                <span className="mb-2 block">Purchase price</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none"
                  defaultValue={useManualPrice ? "198.40" : "Live market"}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Invested amount", "$2,380.80"],
                  ["Current value", "$2,577.96"],
                  ["Profit/Loss", "+$197.16"],
                  ["P/L %", "+8.27%"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8"
        >
          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance trend</CardTitle>
                  <CardDescription>Animated 7-day trajectory</CardDescription>
                </div>
                <Button variant="secondary" size="sm">
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      vertical={false}
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <XAxis
                      dataKey="day"
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
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Shell>
  );
}
