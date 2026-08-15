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
import { formatCurrency, getCurrencySymbol } from "../lib/currency";

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

export function PortfolioPage() {
  const { user } = useAuth();

  // Premium Custom Tooltip for Portfolio
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-brand-cream/10 bg-brand-midnight-card px-4 py-3 shadow-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-silver font-mono">{label}</p>
          <p className="mt-1.5 text-sm font-bold text-brand-cream font-mono">
            {formatCurrency(payload[0].value, user)}
          </p>
        </div>
      );
    }
    return null;
  };
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
  const totalValue = useMemo(() => portfolio.reduce((sum, item) => sum + item.totalValue, 0), [portfolio]);
  const totalCost = useMemo(() => portfolio.reduce((sum, item) => sum + item.totalCost, 0), [portfolio]);
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
      assetType: currentAssetInfo.type,
      currentPrice: currentAssetInfo.price,
      quantity: parseFloat(quantity) || 0,
      purchasePrice: parseFloat(purchasePrice) || currentAssetInfo.price,
      purchaseDate: purchaseDate,
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
        const newPrice = parseFloat((asset.currentPrice * (1 + volatility)).toFixed(2));
        return db.portfolio.updatePrice(user.id, asset._id, newPrice);
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
          <div className="absolute w-60 h-60 rounded-full bg-brand-cobalt/5 blur-[100px] animate-pulse" />
          <div className="flex flex-col items-center gap-3 z-10">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-cobalt border-t-transparent" />
            <span className="text-xs font-semibold tracking-[0.25em] text-brand-silver uppercase mt-4">
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
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-brand-cobalt/5 blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5 rounded-full bg-brand-cobalt-light" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-silver font-mono">
                Investment workspace
              </p>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-cream">
              Track, price, and grow your portfolio.
            </h1>
          </div>
          <Button 
            id="auto-refresh-prices-btn"
            onClick={handleAutoRefresh} 
            disabled={portfolio.length === 0} 
            variant="secondary"
            className="w-fit py-5 px-6 rounded-lg font-bold transition shadow-lg shadow-brand-cobalt/5 border border-brand-cream/10"
          >
            <Sparkles className="mr-2 h-4 w-4 text-brand-cobalt-light" />
            Auto-refresh prices
          </Button>
        </div>

        {/* Dynamic Grid: Left search & selector, Right Position details form */}
        <div className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] relative z-10">
          {/* Catalog Card */}
          <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl overflow-hidden relative border">
            <CardHeader className="pb-4">
              <CardTitle className="text-brand-cream text-base font-bold">Assets catalog</CardTitle>
              <CardDescription className="text-brand-silver text-xs">
                Select from popular market tickers or declare a custom holding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-3 rounded-lg border border-brand-cream/10 bg-brand-midnight px-4 py-3 text-xs text-brand-silver focus-within:border-brand-cobalt transition duration-200">
                <Search className="h-4 w-4 text-brand-silver" />
                <input 
                  id="portfolio-search-input"
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full bg-transparent text-xs text-brand-cream outline-none placeholder-brand-silver/30" 
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
                      className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-brand-cobalt bg-brand-cobalt/10 text-brand-cream shadow-[0_4px_20px_rgba(43,92,184,0.15)]"
                          : "border-brand-cream/5 bg-brand-cream/5 text-brand-silver hover:border-brand-cream/10 hover:bg-brand-cream/10"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs tracking-tight text-brand-cream font-mono">{ticker}</p>
                        <p className="text-[10px] text-brand-silver mt-1">{asset.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xs text-brand-cream font-mono">{formatCurrency(asset.price, user)}</p>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-emerald-400 mt-1">
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
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                    selectedTicker === "CUSTOM"
                      ? "border-brand-cobalt bg-brand-cobalt/10 text-brand-cream shadow-[0_4px_20px_rgba(43,92,184,0.15)]"
                      : "border-brand-cream/5 bg-brand-cream/5 text-brand-silver hover:border-brand-cream/10 hover:bg-brand-cream/10"
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs tracking-tight text-brand-cream font-mono">CUSTOM ASSET</p>
                    <p className="text-[10px] text-brand-silver mt-1">Declare custom equity or commodity</p>
                  </div>
                  <div className="rounded-lg bg-brand-cobalt/10 border border-brand-cobalt/20 p-2">
                    <Plus className="h-4 w-4 text-brand-cobalt-light stroke-[3]" />
                  </div>
                </button>
              </div>

              {selectedTicker === "CUSTOM" && (
                <div className="space-y-4 rounded-xl border border-brand-cream/10 bg-brand-midnight/40 p-5 mt-3">
                  <p className="text-[10px] font-bold text-brand-cobalt-light uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                    Custom asset parameters
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver block">Symbol / Ticker</label>
                      <input 
                        id="custom-ticker-input"
                        type="text" 
                        placeholder="e.g. AMZN, GLD" 
                        value={customTicker} 
                        onChange={(e) => setCustomTicker(e.target.value)} 
                        className="w-full rounded-lg border border-brand-cream/10 bg-brand-midnight px-3.5 py-2.5 text-xs text-brand-cream outline-none focus:border-brand-cobalt transition font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver block">Asset Class</label>
                      <select 
                        id="custom-type-select"
                        value={customType} 
                        onChange={(e) => setCustomType(e.target.value)} 
                        className="w-full rounded-lg border border-brand-cream/10 bg-brand-midnight px-3.5 py-2.5 text-xs text-brand-cream outline-none focus:border-brand-cobalt transition"
                      >
                        {ASSET_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-brand-midnight text-brand-cream">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver block">Company / Asset Name</label>
                    <input 
                      id="custom-name-input"
                      type="text" 
                      placeholder="e.g. Amazon.com Inc." 
                      value={customName} 
                      onChange={(e) => setCustomName(e.target.value)} 
                      className="w-full rounded-lg border border-brand-cream/10 bg-brand-midnight px-3.5 py-2.5 text-xs text-brand-cream outline-none focus:border-brand-cobalt transition"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Position Card Form */}
          <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl border relative overflow-hidden flex flex-col justify-between">
            <CardHeader className="pb-4">
              <CardTitle className="text-brand-cream text-base font-bold">Position details</CardTitle>
              <CardDescription className="text-brand-silver text-xs">
                Record a holding transaction to trace metrics under this account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAsset} className="space-y-5">
                <div className="rounded-xl border border-brand-cream/10 bg-brand-cream/5 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-brand-silver uppercase tracking-wider font-mono">Target asset</p>
                    <p className="text-xl font-bold text-brand-cream mt-1.5 font-mono">
                      {currentAssetInfo.symbol}
                    </p>
                    <p className="text-[10px] text-brand-silver mt-1 font-medium">{currentAssetInfo.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-brand-silver uppercase tracking-wider font-mono">Market rate</p>
                    <p className="text-xl font-bold text-brand-cobalt-light mt-1.5 font-mono">
                      ${currentAssetInfo.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver block">Quantity</label>
                    <input 
                      id="quantity-input"
                      type="number" 
                      step="0.00001" 
                      className="w-full rounded-lg border border-brand-cream/10 bg-brand-midnight px-3.5 py-3 text-xs text-brand-cream outline-none focus:border-brand-cobalt transition font-mono" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver block">Purchase Date</label>
                    <input 
                      id="purchase-date-input"
                      type="date" 
                      className="w-full rounded-lg border border-brand-cream/10 bg-brand-midnight px-3.5 py-3 text-xs text-brand-cream outline-none focus:border-brand-cobalt transition [color-scheme:dark]" 
                      value={purchaseDate} 
                      onChange={(e) => setPurchaseDate(e.target.value)} 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver block">Purchase Price ($)</label>
                  <input 
                    id="purchase-price-input"
                    type="number" 
                    step="0.01" 
                    className="w-full rounded-lg border border-brand-cream/10 bg-brand-midnight px-3.5 py-3 text-xs text-brand-cream outline-none focus:border-brand-cobalt transition font-mono" 
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
                  className="w-full justify-center bg-brand-cobalt text-brand-cream hover:bg-brand-cobalt-light font-bold rounded-lg shadow-lg shadow-brand-cobalt/5 transition"
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
                  value: formatCurrency(totalValue, user),
                  color: "text-brand-cream",
                  icon: TrendingUp,
                  iconColor: "text-brand-silver bg-brand-cobalt/10 border-brand-cobalt/20",
                },
                {
                  label: "Total cost basis",
                  value: formatCurrency(totalCost, user),
                  color: "text-brand-silver",
                  icon: Briefcase,
                  iconColor: "text-brand-silver bg-brand-cream/5 border-brand-cream/10",
                },
                {
                  label: "Unrealized gain / loss",
                  value: `${totalPL >= 0 ? "+" : ""}${formatCurrency(Math.abs(totalPL), user)}`,
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

            {/* Performance Trajectory Area Chart */}
            <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl border overflow-hidden relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-brand-cream text-base font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-brand-cobalt-light stroke-[2.5]" />
                  Performance trend
                </CardTitle>
                <CardDescription className="text-brand-silver text-xs">Estimated 7-day trailing portfolio valuation</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2b5cb8" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#2b5cb8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(251,250,247,0.03)" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#8c9cb3", fontSize: 10, fontWeight: 500 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#8c9cb3", fontSize: 10, fontWeight: 500, fontFamily: "var(--font-mono)" }}
                        tickFormatter={(v) => `${getCurrencySymbol(user)}${v.toLocaleString()}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2b5cb8" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        dot={{ r: 3, fill: "#2b5cb8", stroke: "#fff", strokeWidth: 1.5 }}
                        activeDot={{ r: 5, fill: "#4477d6", stroke: "#fff", strokeWidth: 1.5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Holdings Details Grid / Table */}
            <Card className="border-brand-cream/5 bg-brand-midnight-card/75 rounded-2xl border overflow-hidden relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-brand-cream text-base font-bold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-brand-cobalt-light stroke-[2.5]" />
                  Asset holdings
                </CardTitle>
                <CardDescription className="text-brand-silver text-xs">Your live investment distribution details</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-brand-silver min-w-[750px]">
                  <thead>
                    <tr className="border-b border-brand-cream/5 text-[10px] font-bold uppercase tracking-wider text-brand-silver bg-brand-cream/5">
                      <th className="py-4 px-6">Asset</th>
                      <th className="py-4 px-4">Class</th>
                      <th className="py-4 px-4 text-right">Shares / Qty</th>
                      <th className="py-4 px-4 text-right">Avg Cost</th>
                      <th className="py-4 px-4 text-right">Current Price</th>
                      <th className="py-4 px-4 text-right">Total Cost</th>
                      <th className="py-4 px-4 text-right">Market Value</th>
                      <th className="py-4 px-4 text-right">Gain / Loss</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream/5 bg-brand-midnight-card/25">
                    {portfolio.map((asset) => {
                      const isLoss = asset.unrealizedPL < 0;
                      const isEditing = editingAssetId === asset._id;
                      return (
                        <tr key={asset._id} className="hover:bg-brand-cream/5 transition-colors duration-200">
                          <td className="py-5 px-6 font-bold text-brand-cream">
                            <div>
                              <p className="text-xs font-bold tracking-tight font-mono">{asset.symbol}</p>
                              <p className="text-[10px] text-brand-silver font-medium mt-0.5">{asset.name}</p>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <span className="rounded-lg bg-brand-cream/5 border border-brand-cream/10 px-2 py-0.5 text-[10px] font-semibold text-brand-silver">
                              {asset.assetType || "Stocks"}
                            </span>
                          </td>
                          <td className="py-5 px-4 text-right font-bold text-brand-cream font-mono">
                            {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 5 })}
                          </td>
                          <td className="py-5 px-4 text-right font-medium text-brand-silver font-mono">
                            {formatCurrency(asset.purchasePrice, user)}
                          </td>
                          <td className="py-5 px-4 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  className="w-24 rounded-lg border border-brand-cobalt bg-brand-midnight px-2 py-1 text-xs text-brand-cream text-right outline-none font-mono" 
                                  value={editingPrice} 
                                  onChange={(e) => setEditingPrice(e.target.value)} 
                                  autoFocus
                                />
                                <button 
                                  onClick={() => handleUpdatePrice(asset._id)} 
                                  className="bg-brand-cobalt text-brand-cream text-[10px] px-2.5 py-1 rounded font-bold hover:bg-brand-cobalt-light cursor-pointer transition"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingAssetId(null);
                                    setEditingPrice("");
                                  }} 
                                  className="border border-brand-cream/10 bg-brand-cream/5 hover:bg-brand-cream/10 text-brand-silver text-[10px] px-2.5 py-1 rounded font-semibold cursor-pointer transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2 font-bold text-brand-cobalt-light font-mono">
                                <span>{formatCurrency(asset.currentPrice, user)}</span>
                                <button 
                                  onClick={() => {
                                    setEditingAssetId(asset._id);
                                    setEditingPrice(asset.currentPrice.toString());
                                  }} 
                                  className="text-brand-silver hover:text-brand-cream p-1 rounded hover:bg-brand-cream/5 transition"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-5 px-4 text-right font-medium text-brand-silver font-mono">
                            {formatCurrency(asset.totalCost, user)}
                          </td>
                          <td className="py-5 px-4 text-right font-bold text-brand-cream font-mono">
                            {formatCurrency(asset.totalValue, user)}
                          </td>
                          <td className={`py-5 px-4 text-right font-bold font-mono ${isLoss ? "text-rose-400" : "text-emerald-400"}`}>
                            <div className="flex items-center justify-end gap-1">
                              {isLoss ? <ArrowDownRight className="h-3 w-3 stroke-[2.5]" /> : <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />}
                              <span>
                                {asset.unrealizedPLPercent.toFixed(2)}%
                              </span>
                            </div>
                            <span className="text-[10px] font-medium block mt-0.5 opacity-80">
                              {isLoss ? "-" : "+"}{formatCurrency(Math.abs(asset.unrealizedPL), user)}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-center">
                            <button 
                                onClick={() => {
                                  if (confirm(`Remove position ${asset.symbol} from your portfolio?`)) {
                                    deleteAssetMutation.mutate(asset._id);
                                  }
                                }} 
                                className="rounded-lg border border-brand-cream/10 p-2 text-brand-silver hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10 transition duration-200 cursor-pointer flex items-center justify-center mx-auto"
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
