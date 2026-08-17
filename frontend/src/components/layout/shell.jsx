import { useState, useEffect } from "react";
import { Landmark, ShieldCheck, Sparkles, LogOut, User, LayoutDashboard, Briefcase, Percent, Globe, Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../providers/auth-provider";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

export function Shell({ children }) {
    const { user, signOut, updateProfile } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isAppView = ["/dashboard", "/portfolio", "/loans", "/profile"].includes(location.pathname);

    // Apply accent theme to <html> whenever the user's saved theme changes
    useEffect(() => {
        const theme = user?.settings?.theme || "cobalt";
        document.documentElement.setAttribute("data-theme", theme === "cobalt" ? "" : theme);
    }, [user?.settings?.theme]);

    const navItems = isAppView
        ? [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Portfolio", href: "/portfolio", icon: Briefcase },
            { label: "Loans", href: "/loans", icon: Percent },
            { label: "Profile", href: "/profile", icon: User },
        ]
        : [
            { label: "Features", href: "#product" },
            { label: "Sandbox", href: "#sandbox" },
            { label: "FAQ", href: "#faq" },
        ];

    return (
        <div className="min-h-screen bg-brand-midnight text-brand-cream font-sans flex flex-col justify-between selection:bg-brand-cobalt/40">
            {/* Header Navigation */}
            <header className="sticky top-0 z-50 w-full bg-brand-midnight border-b border-brand-cream/5">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.5rem] flex items-center justify-between">
                <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 text-sm font-bold tracking-[0.25em] text-brand-cream uppercase hover:opacity-90 transition">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-cobalt/40 bg-brand-cobalt/10 shadow-[0_4px_16px_rgba(43,92,184,0.15)]">
                        <Landmark className="h-4.5 w-4.5 text-brand-cobalt-light"/>
                    </div>
                    Finvest
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-wide">
                    {navItems.map((item) => (
                        isAppView ? (
                            <Link 
                                key={item.label} 
                                to={item.href} 
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition ${
                                    location.pathname === item.href
                                        ? "bg-brand-cobalt/10 text-brand-cream border-brand-cobalt/35"
                                        : "text-brand-silver hover:text-brand-cream border-transparent"
                                }`}
                            >
                                {item.icon && <item.icon className="h-3.5 w-3.5"/>}
                                {item.label}
                            </Link>
                        ) : (
                            <a 
                                key={item.label} 
                                href={item.href} 
                                className="text-brand-silver hover:text-brand-cream transition duration-200"
                            >
                                {item.label}
                            </a>
                        )
                    ))}
                </nav>
                
                <div className="flex items-center gap-4">
                    {isAppView ? (
                        user && (
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Global Currency Selector Dropdown */}
                                <div className="flex items-center gap-1">
                                    <Globe className="h-3.5 w-3.5 text-brand-cobalt-light" />
                                    <select
                                        id="global-currency-selector"
                                        value={user.settings?.currency || "USD"}
                                        onChange={async (e) => {
                                            try {
                                                await updateProfile({
                                                    settings: {
                                                        ...user.settings,
                                                        currency: e.target.value
                                                    }
                                                });
                                                toast.success(`Currency switched to ${e.target.value}`);
                                            } catch (err) {
                                                toast.error("Failed to update currency setting");
                                            }
                                        }}
                                        className="bg-brand-cream/5 border border-brand-cream/10 hover:border-brand-cobalt/35 text-[10px] md:text-[11px] font-semibold text-brand-cream rounded-lg py-1 px-1.5 md:py-1.5 md:px-2.5 outline-none cursor-pointer [color-scheme:dark] transition duration-200 font-mono animate-none"
                                    >
                                        <option value="USD" className="bg-brand-midnight text-brand-cream">USD</option>
                                        <option value="EUR" className="bg-brand-midnight text-brand-cream">EUR</option>
                                        <option value="GBP" className="bg-brand-midnight text-brand-cream">GBP</option>
                                        <option value="INR" className="bg-brand-midnight text-brand-cream">INR</option>
                                        <option value="JPY" className="bg-brand-midnight text-brand-cream">JPY</option>
                                        <option value="CAD" className="bg-brand-midnight text-brand-cream">CAD</option>
                                        <option value="AUD" className="bg-brand-midnight text-brand-cream">AUD</option>
                                        <option value="CHF" className="bg-brand-midnight text-brand-cream">CHF</option>
                                        <option value="CNY" className="bg-brand-midnight text-brand-cream">CNY</option>
                                    </select>
                                </div>

                                <Link to="/profile" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition cursor-pointer border-l border-brand-cream/10 pl-2 md:pl-4">
                                    <div className="hidden flex-col items-end md:flex">
                                        <span className="text-xs font-semibold text-brand-cream">{user.name}</span>
                                        <span className="text-[10px] text-brand-silver font-mono">{user.email}</span>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-cream/10 bg-brand-cream/5">
                                        <User className="h-4 w-4 text-brand-cobalt-light"/>
                                    </div>
                                </Link>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => signOut()} 
                                    className="rounded-full h-8 w-8 text-brand-silver hover:text-brand-cream hover:bg-brand-cream/5 cursor-pointer" 
                                    title="Sign out"
                                >
                                    <LogOut className="h-4 w-4"/>
                                </Button>
                            </div>
                        )
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/dashboard">
                                    <button className="bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold text-xs py-2 px-4 rounded-lg transition duration-200 cursor-pointer shadow-lg shadow-brand-cobalt/5">
                                        Launch App
                                    </button>
                                </Link>
                            </div>
                            {/* Hamburger Menu Button */}
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="flex md:hidden items-center justify-center p-2 rounded-lg text-brand-silver hover:text-brand-cream hover:bg-brand-cream/5 transition border border-brand-cream/5 bg-brand-cream/5 cursor-pointer"
                                aria-label="Toggle Menu"
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            </header>

            {/* Mobile Navigation Drawer for Landing Page */}
            {!isAppView && isMobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-[4.5rem] bg-brand-midnight/98 backdrop-blur-xl border-b border-brand-cream/10 z-50 p-6 flex flex-col gap-6 shadow-2xl">
                    <nav className="flex flex-col gap-4 text-sm font-medium tracking-wide">
                        {navItems.map((item) => (
                            <a 
                                key={item.label} 
                                href={item.href} 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-brand-silver hover:text-brand-cream transition duration-200 py-2 border-b border-brand-cream/5"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                        <button className="w-full bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold text-sm py-3 px-4 rounded-lg transition duration-200 cursor-pointer shadow-lg shadow-brand-cobalt/5 text-center">
                            Launch App
                        </button>
                    </Link>
                </div>
            )}

            {/* Main Content Area */}
            <main className={`flex-1 ${isAppView ? "pb-20 md:pb-0" : ""}`}>
                {children}
            </main>

            {/* Bottom Mobile Navigation Dock */}
            {isAppView && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-brand-midnight-card/90 backdrop-blur-xl border-t border-brand-cream/10 z-50 flex items-center justify-around px-4 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
                                    isActive
                                        ? "text-brand-cream font-semibold"
                                        : "text-brand-silver hover:text-brand-cream"
                                }`}
                            >
                                <Icon className={`h-5 w-5 transition ${isActive ? "text-brand-cobalt-light" : "text-brand-silver"}`} />
                                <span className="text-[10px] tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            )}

            {/* Footer */}
            <footer className="w-full border-t border-brand-cream/5 bg-brand-midnight py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-xs text-brand-silver">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-emerald-400"/>
                        <span>SOC 2 ready - bank-grade encryption</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-brand-cobalt-light"/> Trusted by modern builders
                        </span>
                        <span className="flex items-center gap-2">
                            <Landmark className="h-3.5 w-3.5 text-brand-cobalt-light"/> Finvest Corp. © 2026
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
