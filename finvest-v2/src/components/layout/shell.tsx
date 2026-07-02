import {
  ArrowRight,
  BarChart3,
  Landmark,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Insights", href: "#insights" },
  { label: "Pricing", href: "#pricing" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(167,139,250,0.16),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_32%,_#111827)] text-slate-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a
          href="#"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.3em] text-slate-200 uppercase"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 shadow-[0_12px_40px_rgba(34,211,238,0.18)]">
            <Landmark className="h-5 w-5 text-cyan-300" />
          </div>
          Finvest
        </a>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Button size="sm" className="rounded-full">
          Open app
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
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
