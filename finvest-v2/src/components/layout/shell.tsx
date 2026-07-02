import {
  ArrowRight,
  BarChart3,
  Landmark,
  ShieldCheck,
  Sparkles,
  LogOut,
  User,
  LayoutDashboard,
  Briefcase,
  Percent
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../providers/auth-provider";
import { Link, useLocation } from "react-router-dom";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isAppView = ["/dashboard", "/portfolio", "/loans"].includes(location.pathname);

  const navItems: { label: string; href: string; icon?: any }[] = isAppView
    ? [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Portfolio", href: "/portfolio", icon: Briefcase },
        { label: "Loans", href: "/loans", icon: Percent },
      ]
    : [
        { label: "Product", href: "/#product" },
        { label: "Insights", href: "/#insights" },
        { label: "Pricing", href: "/#pricing" },
      ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(167,139,250,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_32%,_#111827)] text-slate-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link
          to={user ? "/dashboard" : "/"}
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.3em] text-slate-200 uppercase"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 shadow-[0_12px_40px_rgba(34,211,238,0.18)]">
            <Landmark className="h-5 w-5 text-cyan-300" />
          </div>
          Finvest
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {navItems.map((item) => (
            isAppView ? (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition ${
                  location.pathname === item.href
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="transition hover:text-white"
              >
                {item.label}
              </a>
            )
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end md:flex">
                <span className="text-sm font-medium text-white">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <User className="h-4 w-4 text-cyan-300" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="rounded-full text-slate-400 hover:text-white hover:bg-white/5"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/dashboard">
              <Button size="sm" className="rounded-full">
                Open app
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main>{children}</main>

      <footer className="mx-auto mt-20 flex max-w-7xl flex-col gap-6 border-t border-white/10 px-6 py-10 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          SOC 2 ready · bank-grade encryption
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-400" /> Trusted by modern
            finance teams
          </span>
          <span className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-400" /> Live analytics
            built in
          </span>
        </div>
      </footer>
    </div>
  );
}
