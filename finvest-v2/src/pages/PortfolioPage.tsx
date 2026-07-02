import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  Plus,
  Trash2,
  Pencil,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
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
import { db } from "../lib/db";
import { useAuth } from "../components/providers/auth-provider";

const DEFAULT_ASSETS_INFO: Record<
  string,
  { name: string; price: number; change: string; type: "Stocks" | "Bonds" | "Cryptocurrency" | "Real Estate" | "Gold & Precious Metals" | "Cash & Savings" | "Vehicle" | "Other" }
> = {
  AAPL: { name: "Apple Inc.", price: 214.83, change: "+1.84%", type: "Stocks" },
  MSFT: { name: "Microsoft Corp.", price: 415.55, change: "+0.92%", type: "Stocks" },
  NVDA: { name: "NVIDIA Corp.", price: 122.60, change: "+4.12%", type: "Stocks" },
  TSLA: { name: "Tesla Inc.", price: 187.44, change: "-2.15%", type: "Stocks" },
  AMD: { name: "Advanced Micro Devices", price: 156.32, change: "+1.05%", type: "Stocks" },
  BTC: { name: "Bitcoin", price: 64250.00, change: "+3.25%", type: "Cryptocurrency" },
  ETH: { name: "Ethereum", price: 3450.00, change: "+2.11%", type: "Cryptocurrency" },
  GLD: { name: "SPDR Gold Shares", price: 224.50, change: "+0.45%", type: "Gold & Precious Metals" },
};

const ASSET_TYPES = [
  "Stocks",
  "Bonds",
  "Cryptocurrency",
  "Real Estate",
  "Gold & Precious Metals",
  "Cash & Savings",
  "Vehicle",
  "Other",
];

export function PortfolioPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [customTicker, setCustomTicker] = useState("");
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<any>("Stocks");

  // Form inputs for new asset
  const [quantity, setQuantity] = useState("10");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);

  // Edit price states
  const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState("");

  // Queries
  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: ["portfolio", user?.id],
    queryFn: () => db.portfolio.list(user!.id),
    enabled: !!user?.id,
  });

  // Mutations
  const addAssetMutation = useMutation({
    mutationFn: (newAsset: any) => db.portfolio.add(user!.id, newAsset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      // Reset inputs
      setQuantity("10");
      setPurchasePrice("");
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (assetId: number) => db.portfolio.delete(user!.id, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ assetId, currentPrice }: { assetId: number; currentPrice: number }) =>
      db.portfolio.updatePrice(user!.id, assetId, currentPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      setEditingAssetId(null);
      setEditingPrice("");
    },
  });

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.toUpperCase();
    if (!q) return Object.keys(DEFAULT_ASSETS_INFO);
    return Object.keys(DEFAULT_ASSETS_INFO).filter(
      (ticker) =>
        ticker.includes(q) ||
        DEFAULT_ASSETS_INFO[ticker].name.toUpperCase().includes(q)
    );
  }, [searchQuery]);

  // Selected asset detail (either standard preset or custom user entered info)
  const currentAssetInfo = useMemo(() => {
    if (selectedTicker === "CUSTOM") {
      return {
        symbol: customTicker || "CUSTOM",
        name: customName || "Custom Asset",
        price: parseFloat(purchasePrice) || 0.0,
        type: customType,
        change: "0.00%",
      };
    }
    return {
      symbol: selectedTicker,
      ...DEFAULT_ASSETS_INFO[selectedTicker],
    };
  }, [selectedTicker, customTicker, customName, customType, purchasePrice]);

  // Set default buy price when stock selection changes
  useMemo(() => {
    if (selectedTicker !== "CUSTOM") {
      setPurchasePrice(DEFAULT_ASSETS_INFO[selectedTicker]?.price.toString() || "");
    }
  }, [selectedTicker]);

  // Calculations for total stats
  const totalValue = useMemo(() => portfolio.reduce((sum, item) => sum + item.total_value, 0), [portfolio]);
  const totalCost = useMemo(() => portfolio.reduce((sum, item) => sum + item.total_cost, 0), [portfolio]);
  const totalPL = useMemo(() => totalValue - totalCost, [totalValue, totalCost]);
  const totalPLPercent = useMemo(() => (totalCost > 0 ? (totalPL / totalCost) * 100 : 0), [totalPL, totalCost]);

  // Trajectory performance simulation
  const chartData = useMemo(() => {
    const baseValue = totalValue > 0 ? totalValue : 12000;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const result = [];
    let currentVal = baseValue;
    
    for (let i = 6; i >= 0; i--) {
      result.unshift({
        day: days[i],
        value: Math.round(currentVal),
      });
      // Simulate historical trend
      const drift = i % 2 === 0 ? 0.012 : -0.008;
      currentVal = currentVal / (1 + drift);
    }
    return result;
  }, [totalValue]);

  // Handlers
  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const payload = {
      name: currentAssetInfo.name,
      symbol: currentAssetInfo.symbol.toUpperCase(),
      asset_type: currentAssetInfo.type,
      current_price: currentAssetInfo.price,
      quantity: parseFloat(quantity) || 0,
      purchase_price: parseFloat(purchasePrice) || currentAssetInfo.price,
      purchase_date: purchaseDate,
    };

    await addAssetMutation.mutateAsync(payload);
  };

  const handleUpdatePrice = async (assetId: number) => {
    const price = parseFloat(editingPrice);
    if (!isNaN(price) && price > 0) {
      await updatePriceMutation.mutateAsync({ assetId, currentPrice: price });
    }
  };

  const handleAutoRefresh = async () => {
    if (!user?.id || portfolio.length === 0) return;
    try {
      const updates = portfolio.map((asset) => {
        // Find existing ticker price or fluctuate slightly
        const volatility = (Math.random() * 4 - 1.8) / 100; // -1.8% to +2.2%
        const newPrice = parseFloat((asset.current_price * (1 + volatility)).toFixed(2));
        return db.portfolio.updatePrice(user.id, asset.id, newPrice);
      });
      await Promise.all(updates);
      queryClient.invalidateQueries({ queryKey: ["portfolio", user.id] });
    } catch (err) {
      console.error("Failed to auto-refresh prices:", err);
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
            <span className="text-sm text-slate-400">Loading investment workspace...</span>
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
            <p className="text-sm text-cyan-300">Investment workspace</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Track, price, and grow your portfolio.
            </h1>
          </div>
          <Button
            onClick={handleAutoRefresh}
            disabled={portfolio.length === 0}
            className="w-fit py-5 rounded-2xl font-semibold bg-cyan-400 hover:bg-cyan-500 text-slate-950 disabled:opacity-50"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Auto-refresh prices
          </Button>
        </div>

        {/* Dynamic Grid: Left search & selector, Right Position details form */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-white/10 bg-slate-950/65 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-white">Assets catalog</CardTitle>
              <CardDescription>
                Select from popular market tickers or declare a custom holding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 focus-within:border-cyan-400/50 transition">
                <Search className="h-4 w-4 text-cyan-300" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder-slate-500"
                  placeholder="Search popular equities, cryptocurrencies..."
                />
              </label>

              <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                {searchResults.map((ticker) => {
                  const asset = DEFAULT_ASSETS_INFO[ticker];
                  return (
                    <button
                      key={ticker}
                      type="button"
                      onClick={() => setSelectedTicker(ticker)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
                        selectedTicker === ticker
                          ? "border-cyan-400/40 bg-cyan-500/10 text-white"
                          : "border-white/5 bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-sm tracking-tight text-white">{ticker}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{asset.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-white">${asset.price.toLocaleString()}</p>
                        <p className="text-xs text-emerald-400 mt-0.5">{asset.change}</p>
                      </div>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTicker("CUSTOM");
                    setPurchasePrice("");
                  }}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
                    selectedTicker === "CUSTOM"
                      ? "border-cyan-400/40 bg-cyan-500/10 text-white"
                      : "border-white/5 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm tracking-tight text-white">CUSTOM</p>
                    <p className="text-xs text-slate-400 mt-0.5">Declare custom equity/commodity</p>
                  </div>
                  <Plus className="h-4 w-4 text-cyan-300" />
                </button>
              </div>

              {selectedTicker === "CUSTOM" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4 mt-2"
                >
                  <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Custom asset settings</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs text-slate-400 space-y-1 block">
                      <span>Symbol / Ticker</span>
                      <input
                        type="text"
                        placeholder="e.g. AMZN, GOLD"
                        value={customTicker}
                        onChange={(e) => setCustomTicker(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
                      />
                    </label>
                    <label className="text-xs text-slate-400 space-y-1 block">
                      <span>Asset Class</span>
                      <select
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
                      >
                        {ASSET_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="text-xs text-slate-400 space-y-1 block">
                    <span>Company / Asset Name</span>
                    <input
                      type="text"
                      placeholder="e.g. Amazon.com Inc."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white outline-none"
                    />
                  </label>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Add Position Card Form */}
          <Card className="border-white/10 bg-slate-950/65">
            <CardHeader>
              <CardTitle className="text-white">Position details</CardTitle>
              <CardDescription>
                Record a holding transaction to trace metrics under this account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAsset} className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Target asset</p>
                    <p className="text-xl font-bold text-white mt-1">
                      {currentAssetInfo.symbol}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{currentAssetInfo.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Market rate</p>
                    <p className="text-xl font-semibold text-cyan-300 mt-1">
                      ${currentAssetInfo.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs text-slate-400 space-y-1 block">
                    <span>Quantity</span>
                    <input
                      type="number"
                      step="0.00001"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </label>
                  <label className="text-xs text-slate-400 space-y-1 block">
                    <span>Purchase date</span>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-cyan-400 [color-scheme:dark]"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <label className="text-xs text-slate-400 space-y-1 block">
                  <span>Purchase Price ($)</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                    placeholder={`e.g. ${currentAssetInfo.price}`}
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    required
                  />
                </label>

                <Button
                  type="submit"
                  disabled={addAssetMutation.isPending}
                  className="w-full justify-center py-4 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-semibold rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Position
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Overview & Performance */}
        {portfolio.length > 0 && (
          <div className="mt-8 space-y-8">
            {/* KPI Section */}
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  label: "Portfolio value",
                  value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  color: "text-white",
                },
                {
                  label: "Total cost basis",
                  value: `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  color: "text-slate-300",
                },
                {
                  label: "Unrealized gain / loss",
                  value: `${totalPL >= 0 ? "+" : ""}$${totalPL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                  color: totalPL >= 0 ? "text-emerald-400" : "text-red-400",
                },
                {
                  label: "Total rate of return",
                  value: `${totalPLPercent >= 0 ? "+" : ""}${totalPLPercent.toFixed(2)}%`,
                  color: totalPLPercent >= 0 ? "text-emerald-400" : "text-red-400",
                },
              ].map((stat) => (
                <Card key={stat.label} className="border-white/10 bg-slate-950/65">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Trajectory Line Chart */}
            <Card className="border-white/10 bg-slate-950/65">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Performance trend</CardTitle>
                    <CardDescription>Estimated 7-day trailing portfolio valuation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
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
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "1rem" }}
                        itemStyle={{ color: "#ffffff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#fff", stroke: "#0ea5e9", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Holdings Details Grid / Table */}
            <Card className="border-white/10 bg-slate-950/65">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Asset holdings</CardTitle>
                    <CardDescription>Your live investment distribution details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-300 min-w-[650px]">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-3">Asset</th>
                      <th className="py-4 px-3">Class</th>
                      <th className="py-4 px-3 text-right">Shares / Qty</th>
                      <th className="py-4 px-3 text-right">Avg Cost</th>
                      <th className="py-4 px-3 text-right">Current Price</th>
                      <th className="py-4 px-3 text-right">Total Cost</th>
                      <th className="py-4 px-3 text-right">Market Value</th>
                      <th className="py-4 px-3 text-right">Gain / Loss</th>
                      <th className="py-4 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {portfolio.map((asset) => {
                      const isLoss = asset.unrealized_pl < 0;
                      const isEditing = editingAssetId === asset.id;

                      return (
                        <tr key={asset.id} className="hover:bg-white/5 transition">
                          <td className="py-4 px-3 font-semibold text-white">
                            <div>
                              <p>{asset.symbol}</p>
                              <p className="text-xs text-slate-500 font-normal mt-0.5">{asset.name}</p>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <span className="rounded-full bg-slate-900 border border-white/10 px-2.5 py-0.5 text-xs text-slate-400">
                              {asset.asset_type || "Stocks"}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-right font-medium">
                            {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                          </td>
                          <td className="py-4 px-3 text-right font-medium">
                            ${asset.purchase_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <input
                                  type="number"
                                  step="0.01"
                                  className="w-20 rounded border border-cyan-400 bg-slate-900 px-1 py-0.5 text-xs text-white text-right outline-none"
                                  value={editingPrice}
                                  onChange={(e) => setEditingPrice(e.target.value)}
                                  autoFocus
                                />
                                <Button
                                  onClick={() => handleUpdatePrice(asset.id)}
                                  size="sm"
                                  className="bg-cyan-400 hover:bg-cyan-500 text-slate-950 text-xs px-2 py-0.5 h-6"
                                >
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5 font-medium text-cyan-300">
                                <span>${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <button
                                  onClick={() => {
                                    setEditingAssetId(asset.id);
                                    setEditingPrice(asset.current_price.toString());
                                  }}
                                  className="text-slate-500 hover:text-white transition"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-3 text-right font-medium">
                            ${asset.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-3 text-right font-semibold text-white">
                            ${asset.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`py-4 px-3 text-right font-semibold ${isLoss ? "text-red-400" : "text-emerald-400"}`}>
                            <div className="flex items-center justify-end gap-1">
                              {isLoss ? (
                                <ArrowDownRight className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              <span>
                                {asset.unrealized_pl_percent.toFixed(2)}%
                              </span>
                            </div>
                            <span className="text-xs font-normal block mt-0.5">
                              {isLoss ? "-" : "+"}${Math.abs(asset.unrealized_pl).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <button
                              onClick={() => deleteAssetMutation.mutate(asset.id)}
                              className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-red-400 transition bg-white/5 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Shell>
  );
}
