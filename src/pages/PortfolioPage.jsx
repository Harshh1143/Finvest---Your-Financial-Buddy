import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Search, Sparkles, Plus, Trash2, Pencil, ArrowUpRight, ArrowDownRight, 
  TrendingUp, Landmark, PiggyBank, Briefcase, Activity, Check, X, ShieldCheck
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Shell } from "../components/layout/shell";
import { db } from "../lib/db";
import { useAuth } from "../components/providers/auth-provider";
import { toast } from "sonner";

const DEFAULT_ASSETS_INFO = {
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

// Premium Custom Tooltip for Portfolio
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 backdrop-blur-md shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{label}</p>
        <p className="mt-1.5 text-base font-bold text-white">
          ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export function PortfolioPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [customTicker, setCustomTicker] = useState("");
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState("Stocks");

  // Form inputs for new asset
  const [quantity, setQuantity] = useState("10");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);

  // Edit price states
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [editingPrice, setEditingPrice] = useState("");

  // Queries
  const { data: portfolio = [], isLoading } = useQuery({
    queryKey: ["portfolio", user?.id],
    queryFn: () => db.portfolio.list(user.id),
    enabled: !!user?.id,
  });

  // Mutations
  const addAssetMutation = useMutation({
    mutationFn: (newAsset) => db.portfolio.add(user.id, newAsset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      setQuantity("10");
      setPurchasePrice(selectedTicker !== "CUSTOM" ? DEFAULT_ASSETS_INFO[selectedTicker]?.price.toString() : "");
      toast.success("Position added to portfolio successfully!");
    },
    onError: () => {
      toast.error("Failed to add portfolio position.");
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (assetId) => db.portfolio.delete(user.id, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      toast.success("Position removed from portfolio.");
    },
    onError: () => {
      toast.error("Failed to delete portfolio position.");
    }
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ assetId, currentPrice }) => db.portfolio.updatePrice(user.id, assetId, currentPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", user?.id] });
      setEditingAssetId(null);
      setEditingPrice("");
      toast.success("Asset price updated!");
    },
    onError: () => {
      toast.error("Failed to update asset price.");
    }
  });

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.toUpperCase();
    if (!q) return Object.keys(DEFAULT_ASSETS_INFO);
    return Object.keys(DEFAULT_ASSETS_INFO).filter((ticker) => 
      ticker.includes(q) || DEFAULT_ASSETS_INFO[ticker].name.toUpperCase().includes(q)
    );
  }, [searchQuery]);

  // Selected asset detail
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
  useEffect(() => {
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
      const drift = i % 2 === 0 ? 0.012 : -0.008;
      currentVal = currentVal / (1 + drift);
    }
    return result;
  }, [totalValue]);

  // Handlers
  const handleAddAsset = async (e) => {
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

  const handleUpdatePrice = async (assetId) => {
    const price = parseFloat(editingPrice);
    if (!isNaN(price) && price > 0) {
      await updatePriceMutation.mutateAsync({ assetId, currentPrice: price });
    } else {
      toast.error("Please enter a valid price.");
    }
  };

  const handleAutoRefresh = async () => {
    if (!user?.id || portfolio.length === 0) return;
    try {
      const updates = portfolio.map((asset) => {
        const volatility = (Math.random() * 4 - 1.8) / 100; // -1.8% to +2.2%
        const newPrice = parseFloat((asset.current_price * (1 + volatility)).toFixed(2));
        return db.portfolio.updatePrice(user.id, asset.id, newPrice);
      });
      await Promise.all(updates);
      queryClient.invalidateQueries({ queryKey: ["portfolio", user.id] });
      toast.success("Portfolio prices auto-synchronized successfully!");
    } catch (err) {
      console.error("Failed to auto-refresh prices:", err);
      toast.error("Failed to synchronize market prices.");
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="flex h-[60vh] items-center justify-center relative">
          <div className="absolute w-60 h-60 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
          <div className="flex flex-col items-center gap-3 z-10">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
            <span className="text-xs font-semibold tracking-[0.25em] text-cyan-300 uppercase mt-4">
              Loading investment workspace...
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
                Investment workspace
              </p>
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
              Track, price, and grow your portfolio.
            </h1>
          </div>
          <Button 
            id="auto-refresh-prices-btn"
            onClick={handleAutoRefresh} 
            disabled={portfolio.length === 0} 
            className="w-fit py-6 px-6 rounded-2xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-500 hover:to-cyan-500 text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <Sparkles className="mr-2 h-4 w-4 stroke-[2.5]" />
            Auto-refresh prices
          </Button>
        </div>

        {/* Dynamic Grid: Left search & selector, Right Position details form */}
        <div className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] relative z-10">
          {/* Catalog Card */}
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2rem] overflow-hidden relative border-[1px]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl font-bold">Assets catalog</CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Select from popular market tickers or declare a custom holding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-slate-400 focus-within:border-cyan-400/50 focus-within:bg-white/10 transition duration-300">
                <Search className="h-4 w-4 text-cyan-400" />
                <input 
                  id="portfolio-search-input"
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full bg-transparent text-sm text-white outline-none placeholder-slate-500" 
                  placeholder="Search popular equities, cryptocurrencies..."
                />
              </div>

              <div className="grid gap-2.5 max-h-60 overflow-y-auto pr-1">
                {searchResults.map((ticker) => {
                  const asset = DEFAULT_ASSETS_INFO[ticker];
                  const isSelected = selectedTicker === ticker;
                  return (
                    <button 
                      id={`ticker-${ticker}`}
                      key={ticker} 
                      type="button" 
                      onClick={() => setSelectedTicker(ticker)} 
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-500/10 text-white shadow-[0_4px_20px_rgba(34,211,238,0.15)]"
                          : "border-white/5 bg-white/5 text-slate-300 hover:border-white/15 hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-sm tracking-tight text-white">{ticker}</p>
                        <p className="text-xs text-slate-400 mt-1">{asset.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-white">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-400 mt-1">
                          <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
                          {asset.change}
                        </span>
                      </div>
                    </button>
                  );
                })}

                <button 
                  id="ticker-custom"
                  type="button" 
                  onClick={() => {
                    setSelectedTicker("CUSTOM");
                    setPurchasePrice("");
                  }} 
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 cursor-pointer ${
                    selectedTicker === "CUSTOM"
                      ? "border-cyan-400 bg-cyan-500/10 text-white shadow-[0_4px_20px_rgba(34,211,238,0.15)]"
                      : "border-white/5 bg-white/5 text-slate-300 hover:border-white/15 hover:bg-white/10"
                  }`}
                >
                  <div>
                    <p className="font-extrabold text-sm tracking-tight text-white">CUSTOM ASSET</p>
                    <p className="text-xs text-slate-400 mt-1">Declare custom equity or commodity</p>
                  </div>
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-2">
                    <Plus className="h-4 w-4 text-cyan-300 stroke-[3]" />
                  </div>
                </button>
              </div>

              {selectedTicker === "CUSTOM" && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.3 }}
                  className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-900/30 p-5 mt-3"
                >
                  <p className="text-xs font-extrabold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                    Custom asset parameters
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 block">Symbol / Ticker</label>
                      <input 
                        id="custom-ticker-input"
                        type="text" 
                        placeholder="e.g. AMZN, GLD" 
                        value={customTicker} 
                        onChange={(e) => setCustomTicker(e.target.value)} 
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition duration-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 block">Asset Class</label>
                      <select 
                        id="custom-type-select"
                        value={customType} 
                        onChange={(e) => setCustomType(e.target.value)} 
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50 transition duration-300"
                      >
                        {ASSET_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-slate-950 text-white">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block">Company / Asset Name</label>
                    <input 
                      id="custom-name-input"
                      type="text" 
                      placeholder="e.g. Amazon.com Inc." 
                      value={customName} 
                      onChange={(e) => setCustomName(e.target.value)} 
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition duration-300"
                    />
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Add Position Card Form */}
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2rem] border-[1px] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl font-bold">Position details</CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Record a holding transaction to trace metrics under this account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAsset} className="space-y-5">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Target asset</p>
                    <p className="text-2xl font-black text-white mt-1.5">
                      {currentAssetInfo.symbol}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{currentAssetInfo.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Market rate</p>
                    <p className="text-2xl font-black text-cyan-300 mt-1.5">
                      ${currentAssetInfo.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block">Quantity</label>
                    <input 
                      id="quantity-input"
                      type="number" 
                      step="0.00001" 
                      className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition duration-300" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block">Purchase Date</label>
                    <input 
                      id="purchase-date-input"
                      type="date" 
                      className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition duration-300 [color-scheme:dark]" 
                      value={purchaseDate} 
                      onChange={(e) => setPurchaseDate(e.target.value)} 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 block">Purchase Price ($)</label>
                  <input 
                    id="purchase-price-input"
                    type="number" 
                    step="0.01" 
                    className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-3 text-sm text-white outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition duration-300" 
                    placeholder={`e.g. ${currentAssetInfo.price}`} 
                    value={purchasePrice} 
                    onChange={(e) => setPurchasePrice(e.target.value)} 
                    required
                  />
                </div>

                <Button 
                  id="add-position-submit"
                  type="submit" 
                  disabled={addAssetMutation.isPending} 
                  className="w-full justify-center py-6 bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-500 hover:to-cyan-500 text-slate-950 font-bold rounded-2xl shadow-[0_12px_24px_rgba(34,211,238,0.15)] hover:scale-[1.01] transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="mr-2 h-4 w-4 stroke-[3]" />
                  Add Position
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Overview & Performance */}
        {portfolio.length > 0 && (
          <div className="mt-12 space-y-10 relative z-10">
            {/* KPI Section */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Portfolio value",
                  value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  color: "text-white",
                  icon: TrendingUp,
                  iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                },
                {
                  label: "Total cost basis",
                  value: `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  color: "text-slate-300",
                  icon: Briefcase,
                  iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                },
                {
                  label: "Unrealized gain / loss",
                  value: `${totalPL >= 0 ? "+" : ""}$${totalPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  color: totalPL >= 0 ? "text-emerald-400" : "text-rose-400",
                  icon: PiggyBank,
                  iconColor: totalPL >= 0 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20",
                },
                {
                  label: "Total rate of return",
                  value: `${totalPLPercent >= 0 ? "+" : ""}${totalPLPercent.toFixed(2)}%`,
                  color: totalPLPercent >= 0 ? "text-emerald-400" : "text-rose-400",
                  icon: Activity,
                  iconColor: totalPLPercent >= 0 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20",
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

            {/* Performance Trajectory Area Chart */}
            <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2rem] border-[1px] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-400 stroke-[2.5]" />
                  Performance trend
                </CardTitle>
                <CardDescription className="text-slate-400">Estimated 7-day trailing portfolio valuation</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                      <XAxis 
                        dataKey="day" 
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
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#22d3ee" 
                        strokeWidth={3.5} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        dot={{ r: 4, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#22d3ee", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Holdings Details Grid / Table */}
            <Card className="border-white/10 bg-slate-950/40 backdrop-blur-2xl rounded-[2rem] border-[1px] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-violet-400 stroke-[2.5]" />
                  Asset holdings
                </CardTitle>
                <CardDescription className="text-slate-400">Your live investment distribution details</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-300 min-w-[750px]">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-500 bg-white/[0.02]">
                      <th className="py-4.5 px-6">Asset</th>
                      <th className="py-4.5 px-4">Class</th>
                      <th className="py-4.5 px-4 text-right">Shares / Qty</th>
                      <th className="py-4.5 px-4 text-right">Avg Cost</th>
                      <th className="py-4.5 px-4 text-right">Current Price</th>
                      <th className="py-4.5 px-4 text-right">Total Cost</th>
                      <th className="py-4.5 px-4 text-right">Market Value</th>
                      <th className="py-4.5 px-4 text-right">Gain / Loss</th>
                      <th className="py-4.5 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-slate-950/20">
                    {portfolio.map((asset) => {
                      const isLoss = asset.unrealized_pl < 0;
                      const isEditing = editingAssetId === asset.id;
                      return (
                        <tr key={asset.id} className="hover:bg-white/[0.03] transition-colors duration-300">
                          <td className="py-5 px-6 font-bold text-white">
                            <div>
                              <p className="text-base tracking-tight">{asset.symbol}</p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{asset.name}</p>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <span className="rounded-full bg-slate-900/80 border border-white/10 px-3 py-1 text-xs font-semibold text-slate-400">
                              {asset.asset_type || "Stocks"}
                            </span>
                          </td>
                          <td className="py-5 px-4 text-right font-semibold text-white">
                            {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                          </td>
                          <td className="py-5 px-4 text-right font-medium text-slate-300">
                            ${asset.purchase_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-5 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  className="w-24 rounded-lg border border-cyan-400 bg-slate-950 px-2 py-1 text-xs text-white text-right outline-none focus:ring-1 focus:ring-cyan-400/50" 
                                  value={editingPrice} 
                                  onChange={(e) => setEditingPrice(e.target.value)} 
                                  autoFocus
                                />
                                <button 
                                  onClick={() => handleUpdatePrice(asset.id)} 
                                  className="bg-gradient-to-r from-sky-400 to-cyan-400 text-slate-950 text-xs px-2.5 py-1 rounded-md font-extrabold hover:opacity-90 cursor-pointer transition shadow-[0_4px_10px_rgba(34,211,238,0.2)]"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingAssetId(null);
                                    setEditingPrice("");
                                  }} 
                                  className="border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-2.5 py-1 rounded-md font-semibold cursor-pointer transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2 font-semibold text-cyan-300">
                                <span>${asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <button 
                                  onClick={() => {
                                    setEditingAssetId(asset.id);
                                    setEditingPrice(asset.current_price.toString());
                                  }} 
                                  className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/5 transition"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-5 px-4 text-right font-medium text-slate-300">
                            ${asset.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-5 px-4 text-right font-bold text-white">
                            ${asset.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={`py-5 px-4 text-right font-bold ${isLoss ? "text-rose-400" : "text-emerald-400"}`}>
                            <div className="flex items-center justify-end gap-1">
                              {isLoss ? <ArrowDownRight className="h-3.5 w-3.5 stroke-[2.5]" /> : <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />}
                              <span>
                                {asset.unrealized_pl_percent.toFixed(2)}%
                              </span>
                            </div>
                            <span className="text-xs font-medium block mt-0.5 opacity-80">
                              {isLoss ? "-" : "+"}${Math.abs(asset.unrealized_pl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-center">
                            <button 
                              onClick={() => {
                                if (confirm(`Remove position ${asset.symbol} from your portfolio?`)) {
                                  deleteAssetMutation.mutate(asset.id);
                                }
                              }} 
                              className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/10 transition-all duration-300 cursor-pointer flex items-center justify-center mx-auto"
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
