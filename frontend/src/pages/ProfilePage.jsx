import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Shield, ShieldAlert, Key, Globe, DollarSign, Euro, PoundSterling, IndianRupee,
  Bell, Palette, RefreshCw, Trash2, CheckCircle2, AlertTriangle, Eye, EyeOff, Coins
} from "lucide-react";
import { useAuth } from "../components/providers/auth-provider";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Shell } from "../components/layout/shell";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { db } from "../lib/db";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", icon: DollarSign },
  { code: "EUR", symbol: "€", name: "Euro", icon: Euro },
  { code: "GBP", symbol: "£", name: "British Pound", icon: PoundSterling },
  { code: "INR", symbol: "₹", name: "Indian Rupee", icon: IndianRupee },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", icon: Coins },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", icon: Coins },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", icon: Coins },
  { code: "CHF", symbol: "Fr.", name: "Swiss Franc", icon: Coins },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", icon: Coins },
];

const THEMES = [
  { id: "cobalt", name: "Royal Cobalt", primary: "#2b5cb8", class: "bg-brand-cobalt" },
  { id: "emerald", name: "Vibrant Emerald", primary: "#10b981", class: "bg-emerald-500" },
  { id: "crimson", name: "Sleek Crimson", primary: "#ef4444", class: "bg-rose-500" },
  { id: "amber", name: "Luxe Amber", primary: "#f59e0b", class: "bg-amber-500" }
];

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Settings states
  const [currency, setCurrency] = useState(user?.settings?.currency || "USD");
  const [alertThreshold, setAlertThreshold] = useState(user?.settings?.alertThreshold || 80);
  const [theme, setTheme] = useState(user?.settings?.theme || "cobalt");
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Danger zone states
  const [confirmResetText, setConfirmResetText] = useState("");
  const [isResettingData, setIsResettingData] = useState(false);

  const handleUpdateProfile = useCallback(async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const payload = { name, email };
      if (password) {
        payload.password = password;
      }
      const result = await updateProfile(payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile details updated successfully!");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("Failed to update profile details");
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [name, email, password, confirmPassword, updateProfile]);

  const handleUpdateSettings = useCallback(async (selectedCurrency, selectedThreshold, selectedTheme) => {
    setIsUpdatingSettings(true);
    try {
      const payload = {
        settings: {
          currency: selectedCurrency || currency,
          alertThreshold: selectedThreshold !== undefined ? selectedThreshold : alertThreshold,
          theme: selectedTheme || theme
        }
      };
      const result = await updateProfile(payload);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Preferences saved successfully!");
      }
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setIsUpdatingSettings(false);
    }
  }, [currency, alertThreshold, theme, updateProfile]);

  const handleResetData = useCallback(async () => {
    if (confirmResetText.toLowerCase() !== "reset") {
      toast.error("Please type 'reset' to confirm data purge");
      return;
    }

    setIsResettingData(true);
    try {
      // Call direct reset endpoint
      await db.auth.resetData();
      
      // Invalidate queries so that dashboard shows clean slate
      queryClient.invalidateQueries();
      toast.success("All financial data has been wiped clean.");
      setConfirmResetText("");
    } catch (err) {
      toast.error("Failed to reset account data");
    } finally {
      setIsResettingData(false);
    }
  }, [confirmResetText, queryClient]);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 relative min-h-screen">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-brand-cobalt/5 blur-[120px] pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5 rounded-full bg-brand-cobalt-light" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-silver font-mono">
                Account Settings
              </p>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-cream">
              Manage Profile & System Preferences
            </h1>
            <p className="text-xs text-brand-silver mt-1 max-w-lg">
              Update authentication credentials, system-wide currencies, alerts, and handle data resets.
            </p>
          </div>
        </div>

        {/* Configuration Layout */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[250px_1fr] relative z-10">
          {/* Tabs Sidebar */}
          <div className="flex flex-row overflow-x-auto gap-2 lg:flex-col lg:overflow-x-visible">
            {[
              { id: "general", label: "Profile Credentials", icon: User },
              { id: "preferences", label: "Preferences & UI", icon: Globe },
              { id: "danger", label: "Danger Zone", icon: ShieldAlert },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-brand-cobalt/10 text-brand-cream border-brand-cobalt/35 shadow-lg shadow-brand-cobalt/5"
                      : "text-brand-silver hover:text-brand-cream border-transparent hover:bg-brand-cream/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Settings Canvas */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-brand-cream/5 bg-brand-midnight-card/75 p-8 rounded-2xl border">
                    <CardHeader className="p-0 pb-6 border-b border-brand-cream/5">
                      <CardTitle className="text-lg font-bold text-brand-cream flex items-center gap-2">
                        <Shield className="h-5 w-5 text-brand-cobalt-light" />
                        Profile Credentials
                      </CardTitle>
                      <CardDescription className="text-xs text-brand-silver">
                        Update your account display name and email address.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-6">
                      <form onSubmit={handleUpdateProfile} className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Full Name</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                              className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3 px-4 text-xs text-brand-cream outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Email Address</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3 px-4 text-xs text-brand-cream outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10"
                            />
                          </div>
                        </div>

                        <div className="border-t border-brand-cream/5 pt-5 space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-brand-cream flex items-center gap-1.5">
                              <Key className="h-4 w-4 text-brand-silver" />
                              Change Password
                            </h4>
                            <p className="text-[10px] text-brand-silver mt-0.5">Leave blank if you do not wish to update your password.</p>
                          </div>

                          <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">New Password</label>
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3 pl-4 pr-10 text-xs text-brand-cream outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver hover:text-brand-cream transition cursor-pointer"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase tracking-wider text-brand-silver font-bold">Confirm New Password</label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3 px-4 text-xs text-brand-cream outline-none transition focus:border-brand-cobalt focus:bg-brand-cream/10"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4">
                          <Button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold px-6 py-3.5 rounded-lg transition cursor-pointer"
                          >
                            {isUpdatingProfile ? "Saving changes..." : "Save Credentials"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "preferences" && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-brand-cream/5 bg-brand-midnight-card/75 p-8 rounded-2xl border">
                    <CardHeader className="p-0 pb-6 border-b border-brand-cream/5">
                      <CardTitle className="text-lg font-bold text-brand-cream flex items-center gap-2">
                        <Globe className="h-5 w-5 text-brand-cobalt-light" />
                        Preferences & UI Config
                      </CardTitle>
                      <CardDescription className="text-xs text-brand-silver">
                        Choose your default system settings, threshold triggers, and UI layout theme.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-6 space-y-6">
                      {/* Currency Preferences */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-brand-cream flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-brand-cobalt-light" />
                            System Base Currency
                          </label>
                          <p className="text-[10px] text-brand-silver mt-0.5">Select the default currency symbol for rendering financial balances.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {CURRENCIES.map((curr) => {
                            const CurrIcon = curr.icon;
                            return (
                              <button
                                key={curr.code}
                                onClick={() => {
                                  setCurrency(curr.code);
                                  handleUpdateSettings(curr.code, undefined, undefined);
                                }}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition cursor-pointer ${
                                  currency === curr.code
                                    ? "bg-brand-cobalt/10 border-brand-cobalt text-brand-cream"
                                    : "bg-brand-cream/5 border-brand-cream/10 text-brand-silver hover:text-brand-cream hover:border-brand-cream/20"
                                }`}
                              >
                                <div className={`rounded-lg p-2 ${currency === curr.code ? "bg-brand-cobalt/20 text-brand-cream" : "bg-brand-cream/5 text-brand-silver"}`}>
                                  <CurrIcon className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold font-mono">{curr.code} ({curr.symbol})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Alert Threshold */}
                      <div className="border-t border-brand-cream/5 pt-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-bold text-brand-cream flex items-center gap-1.5">
                              <Bell className="h-4 w-4 text-brand-cobalt-light" />
                              Budget Alert Threshold
                            </label>
                            <p className="text-[10px] text-brand-silver mt-0.5">Notify me when my monthly spending exceeds this percent of the budget.</p>
                          </div>
                          <span className="text-sm font-bold text-brand-cream font-mono">{alertThreshold}%</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="50"
                            max="100"
                            value={alertThreshold}
                            onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                            onMouseUp={() => handleUpdateSettings(undefined, alertThreshold, undefined)}
                            onTouchEnd={() => handleUpdateSettings(undefined, alertThreshold, undefined)}
                            className="flex-1 accent-brand-cobalt h-1 bg-brand-midnight rounded-lg appearance-none cursor-pointer border border-brand-cream/5"
                          />
                        </div>
                      </div>

                      {/* Accent Color/Theme */}
                      <div className="border-t border-brand-cream/5 pt-5 space-y-3">
                        <div>
                          <label className="text-xs font-bold text-brand-cream flex items-center gap-1.5">
                            <Palette className="h-4 w-4 text-brand-cobalt-light" />
                            Visual Accent Color
                          </label>
                          <p className="text-[10px] text-brand-silver mt-0.5">Personalize the application focus states and design accenting.</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {THEMES.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setTheme(t.id);
                                // Apply instantly (optimistic) — Shell's useEffect will keep it in sync
                                document.documentElement.setAttribute("data-theme", t.id === "cobalt" ? "" : t.id);
                                handleUpdateSettings(undefined, undefined, t.id);
                              }}
                              className={`flex items-center justify-between p-4.5 rounded-xl border transition cursor-pointer ${
                                theme === t.id
                                  ? "bg-brand-cobalt/10 border-brand-cobalt text-brand-cream"
                                  : "bg-brand-cream/5 border-brand-cream/10 text-brand-silver hover:text-brand-cream hover:border-brand-cream/20"
                              }`}
                            >
                              <span className="text-xs font-bold">{t.name}</span>
                              <span className={`h-3.5 w-3.5 rounded-full border border-brand-cream/15 ${t.class}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "danger" && (
                <motion.div
                  key="danger"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-red-500/20 bg-brand-midnight-card/75 p-8 rounded-2xl border">
                    <CardHeader className="p-0 pb-6 border-b border-red-500/10">
                      <CardTitle className="text-lg font-bold text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        Danger Zone
                      </CardTitle>
                      <CardDescription className="text-xs text-brand-silver">
                        Irreversible administrative actions. Please proceed with extreme caution.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 mt-6 space-y-6">
                      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                        <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                          <RefreshCw className="h-4 w-4" />
                          Reset Financial Account Data
                        </h4>
                        <p className="text-[11px] text-brand-silver leading-relaxed mt-1">
                          This action will immediately delete all transactions, budget logs, loans, and savings targets associated with your account.
                          Your account details and login credentials will remain intact. This action cannot be undone.
                        </p>

                        <div className="mt-5 space-y-3">
                          <label className="text-[9px] uppercase tracking-wider text-brand-silver font-bold block">
                            Type <strong className="text-red-400 font-bold">reset</strong> to confirm data purge:
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={confirmResetText}
                              onChange={(e) => setConfirmResetText(e.target.value)}
                              placeholder="Type 'reset' here"
                              className="rounded-lg border border-red-500/20 bg-brand-midnight py-2.5 px-4 text-xs text-brand-cream placeholder-brand-silver/20 outline-none focus:border-red-500 transition font-mono max-w-xs"
                            />
                            <Button
                              onClick={handleResetData}
                              disabled={isResettingData || confirmResetText.toLowerCase() !== "reset"}
                              className="bg-red-500 hover:bg-red-600 text-brand-cream font-bold px-6 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Trash2 className="h-4 w-4" />
                              {isResettingData ? "Purging data..." : "Wipe All Data"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Shell>
  );
}
