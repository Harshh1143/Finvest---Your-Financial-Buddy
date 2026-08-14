import { Landmark, ShieldCheck, Sparkles, LogOut, User, LayoutDashboard, Briefcase, Percent } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../providers/auth-provider";
import { Link, useLocation } from "react-router-dom";

export function Shell({ children }) {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const isAppView = ["/dashboard", "/portfolio", "/loans"].includes(location.pathname);
    const navItems = isAppView
        ? [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Portfolio", href: "/portfolio", icon: Briefcase },
            { label: "Loans", href: "/loans", icon: Percent },
        ]
        : [
            { label: "Features", href: "#product" },
            { label: "Sandbox", href: "#sandbox" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
        ];

    return (
        <div className="min-h-screen bg-brand-midnight text-brand-cream font-sans flex flex-col justify-between selection:bg-brand-cobalt/40">
            {/* Header Navigation */}
            <header className="w-full max-w-7xl mx-auto px-6 h-18 lg:px-8 flex items-center justify-between z-50 border-b border-brand-cream/5">
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
                            <div className="flex items-center gap-3">
                                <div className="hidden flex-col items-end md:flex">
                                    <span className="text-xs font-semibold text-brand-cream">{user.name}</span>
                                    <span className="text-[10px] text-brand-silver font-mono">{user.email}</span>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-cream/10 bg-brand-cream/5">
                                    <User className="h-4 w-4 text-brand-cobalt-light"/>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => signOut()} 
                                    className="rounded-full text-brand-silver hover:text-brand-cream hover:bg-brand-cream/5" 
                                    title="Sign out"
                                >
                                    <LogOut className="h-4 w-4"/>
                                </Button>
                            </div>
                        )
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard">
                                <button className="bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold text-xs py-2 px-4 rounded-lg transition duration-200 cursor-pointer shadow-lg shadow-brand-cobalt/5">
                                    Launch App
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>

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
