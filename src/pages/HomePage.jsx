import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Coins,
  ArrowRight,
  Lock,
  Wallet,
  Percent,
  MessageSquare,
  Zap,
  Check,
  HelpCircle,
  Activity,
  ArrowUpRight,
  Briefcase,
  Layers,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Shell } from "../components/layout/shell";

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Trusted Tech Logos
const brandLogos = [
  { name: "Stripe", icon: Coins },
  { name: "Ramp", icon: Zap },
  { name: "Mercury", icon: ShieldCheck },
  { name: "Vercel", icon: Activity },
  { name: "Linear", icon: Layers },
  { name: "Apple Pay", icon: Wallet },
  { name: "Arc Browser", icon: Sparkles },
];

export function HomePage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const sandboxRef = useRef(null);
  const pricingRef = useRef(null);
  const faqRef = useRef(null);

  // Background Glow Interactive Mouse Tracker
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero element reveals
      gsap.fromTo(
        ".hero-reveal",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );

      // Parallax effect on floating elements in the hero
      gsap.fromTo(
        ".hero-floating",
        { y: 30 },
        { y: -30, scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 } }
      );

      // Feature card fade ins
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Interactive sandbox panel slide-in
      gsap.fromTo(
        ".sandbox-panel",
        { opacity: 0, scale: 0.95, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sandboxRef.current,
            start: "top 75%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // --- STATE FOR INTERACTIVE SANDBOX WIDGETS ---
  const [activeTab, setActiveTab] = useState("emi"); // emi, compound, ai

  // 1. EMI Calculator States
  const [loanAmount, setLoanAmount] = useState(150000);
  const [loanRate, setLoanRate] = useState(6.5);
  const [loanTenure, setLoanTenure] = useState(15); // years

  // Calculate EMI values
  const P = loanAmount;
  const r = loanRate / 12 / 100;
  const n = loanTenure * 12;
  const emi = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
  const totalRepayment = emi * n;
  const totalInterest = Math.max(0, totalRepayment - P);

  const emiPieData = [
    { name: "Principal", value: Math.round(P), color: "#22d3ee" },
    { name: "Total Interest", value: Math.round(totalInterest), color: "#a78bfa" },
  ];

  // 2. Compound Interest Projections States
  const [monthlySavings, setMonthlySavings] = useState(1200);
  const [returnRate, setReturnRate] = useState(8.5);
  const [periodYears, setPeriodYears] = useState(20);

  // Generate Growth data for Recharts
  const growthData = [];
  let totalContributions = 0;
  let balance = 0;
  const monthlyRate = returnRate / 12 / 100;
  const totalMonths = periodYears * 12;

  for (let m = 1; m <= totalMonths; m++) {
    totalContributions += monthlySavings;
    balance = (balance + monthlySavings) * (1 + monthlyRate);
    if (m % 12 === 0 || m === totalMonths) {
      const year = m / 12;
      growthData.push({
        name: `Yr ${Math.round(year)}`,
        Contributions: Math.round(totalContributions),
        Interest: Math.round(Math.max(0, balance - totalContributions)),
        Total: Math.round(balance),
      });
    }
  }

  // 3. AI Insights States
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [aiTyping, setAiTyping] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const aiPrompts = [
    {
      id: "debt",
      label: "Optimize Debt Repayment Strategy",
      response: "Based on your active loans ($150,000 at 6.5% interest), we recommend implementing the Avalanche method. By allocating an extra $350 monthly towards your highest-interest liabilities, you will reduce your repayment timeline by 3.2 years and save $14,820 in total cumulative interest payments. Finvest has pre-configured this automated sweep in your settings.",
    },
    {
      id: "tax",
      label: "Asset Location for Tax Efficiency",
      response: "Your current tax structure reveals 64% of high-growth tech assets sit in taxable brokerage accounts. We advise rebalancing: relocate high-dividend yields and real estate investments to your tax-advantaged accounts (IRA/401k), and hold broad index funds in your standard brokerage. This simple asset location adjustment will increase net long-term yields by approximately 1.4% annually.",
    },
    {
      id: "home",
      label: "Verify Real Estate Purchase Feasibility",
      response: "With a target purchase budget of $650,000 and 20% down ($130,000), your monthly cash reserves easily cover the projected mortgage, property taxes, and insurance ($3,420/month) at current rates. Your post-purchase liquidity remains resilient at 8.4 months of living expenses. It is highly feasible to proceed; we have updated your savings goals to track the down-payment timeline.",
    },
  ];

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt.id);
    setIsTyping(true);
    setAiTyping("");
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < prompt.response.length) {
        setAiTyping((prev) => prev + prompt.response.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 12);
  };

  // --- STATE FOR PRICING SECTION ---
  const [isAnnual, setIsAnnual] = useState(true);

  // --- STATE FOR FAQ SECTION ---
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How does Finvest sync with my bank accounts?",
      answer: "We utilize Plaid for secure, read-only authentication with over 11,000 financial institutions. Finvest never stores or has access to your login credentials or active funds.",
    },
    {
      question: "Can I manage multiple investment portfolios?",
      answer: "Absolutely. Finvest is built to aggregate standard stocks, crypto wallets, real estate holdings, and private equity investments into a unified dashboard, updating asset values live.",
    },
    {
      question: "What is SOC 2 compliance and why is it important?",
      answer: "SOC 2 Type II compliance guarantees that our data processing and security procedures satisfy the highest industry standards audited independently. Your data is encrypted in transit and at rest.",
    },
    {
      question: "Does the AI assistant provide registered financial advice?",
      answer: "No, the AI Insights engine offers analytical modeling and projection tools based on mathematical simulations and historical data. It does not replace professional tax or investment advisory services.",
    },
  ];

  return (
    <div ref={containerRef} className="mesh-gradient min-h-screen relative overflow-hidden font-sans">
      
      {/* Interactive Ambient Radial Glow Blobs */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-transform duration-300 ease-out opacity-25"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.12), transparent 80%),
                       radial-gradient(500px circle at ${mousePos.x + 200}px ${mousePos.y - 100}px, rgba(167, 139, 250, 0.1), transparent 80%)`
        }}
      />

      <Shell>
        {/* ==================================================
            HERO SECTION
            ================================================== */}
        <section ref={heroRef} className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8 lg:pt-24 lg:pb-36 z-10">
          <div className="flex flex-col justify-center space-y-8">
            
            {/* Glowing Pill Badge */}
            <div className="hero-reveal inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
              <span>Finvest 2.0 — The Premium Wealth Operating System</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-reveal max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Wealth management, <br />
              <span className="text-gradient-cyan-purple">designed for clarity.</span>
            </h1>

            {/* Description */}
            <p className="hero-reveal max-w-xl text-lg leading-relaxed text-slate-300">
              Replace standard spreadsheets and generic trackers with a handcrafted workspace. Plan budgets, project investments, simulate loan repayments, and make clean financial decisions.
            </p>

            {/* CTA Actions */}
            <div className="hero-reveal flex flex-wrap gap-4 pt-2">
              <Link to="/dashboard">
                <Button size="lg" className="rounded-full bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition duration-300 px-8 shadow-[0_8px_30px_rgb(34,211,238,0.25)] flex items-center group">
                  Launch Workspace
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <a href="#sandbox">
                <Button variant="outline" size="lg" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition duration-300 px-8">
                  Interactive Simulator
                </Button>
              </a>
            </div>

            {/* Checkmarks */}
            <div className="hero-reveal flex flex-wrap gap-6 pt-4 text-xs font-semibold tracking-wider uppercase text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Unified portfolio tracking
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Smart forecasts & simulations
              </span>
            </div>
          </div>

          {/* Floating Premium Visual Centerpiece */}
          <div className="relative mt-16 lg:mt-0 flex items-center justify-center">
            {/* Visual background lights */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/20 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

            {/* Main Mockup Glass Panel */}
            <div className="hero-floating w-full max-w-[480px] glass-card rounded-3xl p-6 relative border-white/10 shadow-2xl transition duration-500 hover:border-cyan-500/30">
              
              {/* Premium Header Decoration */}
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="text-xs text-slate-500 font-semibold tracking-[0.2em] uppercase">FINVEST PLATFORM</div>
              </div>

              {/* Graphic Asset / Generated Premium Photo */}
              <div className="relative w-full h-[180px] rounded-2xl overflow-hidden mb-6 group border border-white/10">
                <img 
                  src="/fintech_glass_hero.png" 
                  alt="Fintech glass asset" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="text-xs font-semibold text-cyan-300 tracking-wider uppercase mb-1">LIVE PERFORMANCE</div>
                  <div className="text-xl font-bold text-white tracking-tight">+$12,840.42 this month</div>
                </div>
              </div>

              {/* Inflows & Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-400/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Stripe Merchant Inflow</div>
                      <div className="text-sm font-semibold text-white">Settled directly</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-300">+$9,480.00</div>
                    <div className="text-[10px] text-emerald-400 font-bold">+8.2% vs prev</div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-400/20 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-purple-300" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Loan Collateral Vault</div>
                      <div className="text-sm font-semibold text-white">Smart contract secured</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-200">100% active</div>
                    <div className="text-[10px] text-slate-400">Escrowed lock</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small absolute floating secondary card */}
            <div className="hero-floating absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 border-white/10 shadow-xl hidden sm:block max-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
                  <Check className="h-3 w-3 text-emerald-400" />
                </div>
                <div className="text-xs text-slate-300 font-semibold">Net Worth Proj.</div>
              </div>
              <div className="text-lg font-bold text-white">$184.2K</div>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span>+12.4%</span>
                <span className="text-slate-500 font-normal">this year</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            TRUSTED BY SECTION (LOGO TICKER)
            ================================================== */}
        <section className="relative py-12 border-y border-white/5 bg-slate-950/20 backdrop-blur z-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-8">
              ENGINEERED TO INTEGRATE SECURELY WITH MODERN PLATFORMS
            </p>
            
            {/* Logo Marquee Wrapper */}
            <div className="relative flex overflow-x-hidden justify-center items-center">
              <div className="animate-marquee flex gap-12 md:gap-20 items-center justify-center flex-wrap">
                {brandLogos.map((logo, idx) => {
                  const Icon = logo.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition duration-300 group cursor-default">
                      <Icon className="h-5 w-5 text-slate-400 group-hover:text-cyan-300 transition duration-300" />
                      <span className="text-base font-bold text-slate-300 group-hover:text-white transition duration-300 tracking-tight">
                        {logo.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            INTERACTIVE SANDBOX PLAYGROUND SECTION
            ================================================== */}
        <section id="sandbox" ref={sandboxRef} className="mx-auto max-w-7xl px-6 py-20 lg:px-8 z-10 relative">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              Interactive Financial Sandbox
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Simulate before you allocate.
            </p>
            <p className="text-lg text-slate-400">
              Play with real formulas, view beautiful charts, and preview how Finvest automates your intelligence in real time.
            </p>
          </div>

          {/* Sandbox Main Container Grid */}
          <div className="sandbox-panel glass-card rounded-[2.5rem] border-white/10 overflow-hidden shadow-2xl grid lg:grid-cols-[250px_1fr]">
            
            {/* Sidebar Tab Selectors */}
            <div className="bg-slate-950/45 p-6 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
              <button 
                onClick={() => setActiveTab("emi")}
                className={`w-full text-left px-4 py-3 rounded-xl transition duration-300 flex items-center gap-3 font-semibold text-sm whitespace-nowrap ${
                  activeTab === "emi" 
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.06)]"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Percent className="h-4 w-4" />
                EMI Loan Planner
              </button>
              
              <button 
                onClick={() => setActiveTab("compound")}
                className={`w-full text-left px-4 py-3 rounded-xl transition duration-300 flex items-center gap-3 font-semibold text-sm whitespace-nowrap ${
                  activeTab === "compound" 
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.06)]"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Compound Growth
              </button>

              <button 
                onClick={() => setActiveTab("ai")}
                className={`w-full text-left px-4 py-3 rounded-xl transition duration-300 flex items-center gap-3 font-semibold text-sm whitespace-nowrap ${
                  activeTab === "ai" 
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.06)]"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <BrainCircuit className="h-4 w-4" />
                AI Insights Chat
              </button>
            </div>

            {/* Content Display Panels */}
            <div className="p-8 lg:p-12 bg-slate-900/30 min-h-[460px]">
              
              <AnimatePresence mode="wait">
                {/* 1. EMI CALCULATOR PANEL */}
                {activeTab === "emi" && (
                  <motion.div 
                    key="emi"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10"
                  >
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400">TOOL PREVIEW</span>
                        <h3 className="text-2xl font-bold text-white">Mortgage & Loan repayment calculator</h3>
                        <p className="text-sm text-slate-400">Simulate monthly installments and interest curves interactively.</p>
                      </div>

                      {/* Slider 1: Loan Amount */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-slate-300">Loan Principal</span>
                          <span className="text-cyan-300">${loanAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <input 
                          type="range" 
                          min="10000" 
                          max="1000000" 
                          step="5000"
                          value={loanAmount} 
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>$10,000</span>
                          <span>$1,000,000</span>
                        </div>
                      </div>

                      {/* Slider 2: Interest Rate */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-slate-300">Annual Interest Rate</span>
                          <span className="text-cyan-300">{loanRate}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="15" 
                          step="0.1"
                          value={loanRate} 
                          onChange={(e) => setLoanRate(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>1%</span>
                          <span>15%</span>
                        </div>
                      </div>

                      {/* Slider 3: Tenure */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-slate-300">Repayment Period</span>
                          <span className="text-cyan-300">{loanTenure} Years</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="30" 
                          step="1"
                          value={loanTenure} 
                          onChange={(e) => setLoanTenure(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>1 Year</span>
                          <span>30 Years</span>
                        </div>
                      </div>

                      {/* Outflows summary */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase text-slate-400 font-bold">Projected Monthly EMI</span>
                          <p className="text-xl font-bold text-white mt-1">${emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase text-slate-400 font-bold">Total Interest Payable</span>
                          <p className="text-xl font-bold text-purple-300 mt-1">${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>

                    {/* Chart Showcase column */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-950/30 rounded-3xl border border-white/5">
                      <span className="text-xs text-slate-400 font-bold mb-4">PRINCIPAL VS INTEREST RATIO</span>
                      <div className="w-[180px] h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={emiPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {emiPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-6 space-y-2 w-full text-sm">
                        <div className="flex items-center justify-between text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-cyan-400" />
                            <span>Principal Loan</span>
                          </div>
                          <span className="font-bold text-white">${loanAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-400" />
                            <span>Total Interest</span>
                          </div>
                          <span className="font-bold text-white">${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-2 text-slate-200 font-bold">
                          <span>Total Amount</span>
                          <span>${totalRepayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. COMPOUND INTEREST PANEL */}
                {activeTab === "compound" && (
                  <motion.div 
                    key="compound"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10"
                  >
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400">TOOL PREVIEW</span>
                        <h3 className="text-2xl font-bold text-white">Investment growth & compounding planner</h3>
                        <p className="text-sm text-slate-400">Visualize exponential growth driven by automated contributions.</p>
                      </div>

                      {/* Slider 1: Monthly Savings */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-slate-300">Monthly Contribution</span>
                          <span className="text-cyan-300">${monthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo</span>
                        </div>
                        <input 
                          type="range" 
                          min="100" 
                          max="10000" 
                          step="100"
                          value={monthlySavings} 
                          onChange={(e) => setMonthlySavings(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>$100</span>
                          <span>$10,000</span>
                        </div>
                      </div>

                      {/* Slider 2: Rate */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-slate-300">Expected Annual Return</span>
                          <span className="text-cyan-300">{returnRate}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="2" 
                          max="15" 
                          step="0.1"
                          value={returnRate} 
                          onChange={(e) => setReturnRate(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>2%</span>
                          <span>15%</span>
                        </div>
                      </div>

                      {/* Slider 3: Period */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-slate-300">Investment Horizon</span>
                          <span className="text-cyan-300">{periodYears} Years</span>
                        </div>
                        <input 
                          type="range" 
                          min="5" 
                          max="40" 
                          step="1"
                          value={periodYears} 
                          onChange={(e) => setPeriodYears(Number(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>5 Years</span>
                          <span>40 Years</span>
                        </div>
                      </div>

                      {/* Yield summary */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase text-slate-400 font-bold">Total Contributions</span>
                          <p className="text-xl font-bold text-white mt-1">${totalContributions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] uppercase text-slate-400 font-bold">Compound Growth Balance</span>
                          <p className="text-xl font-bold text-cyan-300 mt-1">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </div>

                    {/* Chart Projections area chart */}
                    <div className="p-4 bg-slate-950/30 rounded-3xl border border-white/5 min-h-[220px] flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Compound Interest Curve</span>
                        <div className="flex gap-4 text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <div className="w-2.5 h-2.5 rounded bg-slate-600" /> Contrib.
                          </span>
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <div className="w-2.5 h-2.5 rounded bg-cyan-400" /> Interest
                          </span>
                        </div>
                      </div>

                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={growthData}>
                            <defs>
                              <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#475569" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#475569" stopOpacity={0.01} />
                              </linearGradient>
                              <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.01} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} tick={{ fill: "#64748b", fontSize: 10 }} />
                            <Tooltip formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                            <Area type="monotone" dataKey="Contributions" stroke="#475569" fillOpacity={1} fill="url(#colorContrib)" strokeWidth={1.5} />
                            <Area type="monotone" dataKey="Interest" stroke="#22d3ee" fillOpacity={1} fill="url(#colorInterest)" strokeWidth={2.5} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="text-[10px] text-slate-500 text-center font-medium mt-3">
                        Simulations assume compounding interest at monthly intervals.
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. AI FINANCIAL ADVISORY SIMULATOR */}
                {activeTab === "ai" && (
                  <motion.div 
                    key="ai"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10"
                  >
                    <div className="space-y-6 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400">AI SANDBOX</span>
                        <h3 className="text-2xl font-bold text-white">Smart financial decision assistant</h3>
                        <p className="text-sm text-slate-400">Ask strategic questions and review clean wealth analysis models instantly.</p>
                      </div>

                      {/* Presets Grid */}
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-slate-500 font-semibold uppercase">CLICK TO QUERY THE FINVEST ADVISOR:</p>
                        <div className="grid gap-2">
                          {aiPrompts.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handlePromptSelect(p)}
                              className={`w-full text-left p-3.5 rounded-xl border transition text-xs font-semibold ${
                                selectedPrompt === p.id 
                                  ? "bg-cyan-500/10 text-cyan-300 border-cyan-400/30"
                                  : "bg-white/5 text-slate-300 border-white/5 hover:bg-white/10"
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Output Terminal Console */}
                    <div className="flex flex-col h-[320px] bg-slate-950/40 rounded-3xl border border-white/5 overflow-hidden">
                      <div className="bg-slate-950/60 px-4 py-3 border-b border-white/5 flex items-center justify-between text-xs text-slate-400 font-bold">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span>FINVEST INTELLIGENCE ENGINE</span>
                        </div>
                        <span>STATUS: ACTIVE</span>
                      </div>

                      <div className="p-5 flex-1 overflow-y-auto font-mono text-xs leading-relaxed space-y-4">
                        {selectedPrompt ? (
                          <div className="space-y-3">
                            <div className="text-slate-500">&gt; processing query parameters...</div>
                            <div className="text-cyan-400 font-semibold">&gt; executing analytical sweep...</div>
                            <div className="text-slate-200 border-l-2 border-cyan-400/40 pl-3">
                              {aiTyping}
                              {isTyping && <span className="animate-pulse bg-cyan-400 inline-block w-2 h-4 ml-1" />}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-3">
                            <MessageSquare className="h-8 w-8 text-slate-600" />
                            <p>Select a scenario prompt on the left to see the AI Insight generator analyze portfolio states.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ==================================================
            BENTO GRID PREMIUM FEATURES SECTION
            ================================================== */}
        <section id="product" ref={featuresRef} className="mx-auto max-w-7xl px-6 py-20 lg:px-8 z-10 relative">
          
          <div className="max-w-3xl mb-16 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              Platform Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Wealth management, engineered without compromise.
            </p>
            <p className="text-lg text-slate-400">
              Every detail is meticulously crafted to give you absolute clarity and absolute confidence in your money.
            </p>
          </div>

          {/* Premium Bento Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Box 1: Live Cashflow */}
            <div className="feature-card glass-card rounded-3xl p-8 border-white/10 md:col-span-2 flex flex-col justify-between group hover:border-cyan-400/30 transition duration-300 min-h-[300px]">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center mb-6">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Live Cash Flow Intelligence</h3>
                <p className="text-slate-400 text-sm max-w-xl">
                  Automate the extraction of your income patterns, subscription leaks, and investment contributions into one clean, calm timeline. Finvest structures your ledger instantly with 0 manual inputs required.
                </p>
              </div>
              <div className="flex gap-6 mt-8 text-xs text-slate-500 font-semibold border-t border-white/5 pt-4">
                <span>PLAID INTEGRATED</span>
                <span>REAL-TIME ANALYSIS</span>
                <span>CLEAN CATEGORIZATION</span>
              </div>
            </div>

            {/* Box 2: Goal projections */}
            <div className="feature-card glass-card rounded-3xl p-8 border-white/10 flex flex-col justify-between group hover:border-cyan-400/30 transition duration-300 min-h-[300px]">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Goal Projections</h3>
                <p className="text-slate-400 text-sm">
                  Model large life decisions—buying a home, retiring early, or funding a startup—and see how interest, inflation, and payouts impact your wealth horizon.
                </p>
              </div>
              <div className="flex gap-2 mt-6 justify-between items-center text-xs text-cyan-400 font-semibold">
                <span>Project milestone timelines</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Box 3: Security & Encryption */}
            <div className="feature-card glass-card rounded-3xl p-8 border-white/10 flex flex-col justify-between group hover:border-cyan-400/30 transition duration-300 min-h-[300px]">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Bank-grade Trust</h3>
                <p className="text-slate-400 text-sm">
                  Rest easy knowing your financial assets are guarded by SOC 2 Type II controls, full AES-256 data encryption, and advanced OAuth tokenized bank synchronization.
                </p>
              </div>
              <div className="flex gap-2 mt-6 justify-between items-center text-xs text-emerald-400 font-semibold">
                <span>SOC 2 Type II Auditor Certified</span>
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            {/* Box 4: Holographic Interactive Card Showcase */}
            <div className="feature-card glass-card rounded-3xl p-8 border-white/10 md:col-span-2 flex flex-col lg:flex-row gap-8 items-center justify-between group hover:border-cyan-400/30 transition duration-300 min-h-[300px]">
              <div className="space-y-4 max-w-md">
                <h3 className="text-2xl font-bold text-white">Consolidated Investment Vault</h3>
                <p className="text-slate-400 text-sm">
                  Bring all portfolios under one roof. Track performance, allocate ratios correctly, and review smart, AI-driven diversification recommendations.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-bold bg-white/5 border border-white/5 rounded-full px-3 py-1 text-slate-300">Stocks & ETFs</span>
                  <span className="text-[10px] font-bold bg-white/5 border border-white/5 rounded-full px-3 py-1 text-slate-300">Crypto Wallets</span>
                  <span className="text-[10px] font-bold bg-white/5 border border-white/5 rounded-full px-3 py-1 text-slate-300">Private Equity</span>
                </div>
              </div>
              
              <div className="relative w-full max-w-[240px] h-[160px] rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img 
                  src="/holographic_card.png" 
                  alt="Premium Wealth Card" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            PRICING TIER SECTION
            ================================================== */}
        <section id="pricing" ref={pricingRef} className="mx-auto max-w-7xl px-6 py-20 lg:px-8 z-10 relative">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              Clear Pricing
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              One simple tool. Unlocked.
            </p>
            <p className="text-lg text-slate-400">
              Choose the tier that matches your wealth objectives. No hidden transaction fees, ever.
            </p>

            {/* Toggle switch */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-sm ${!isAnnual ? "text-white font-bold" : "text-slate-400"}`}>Monthly Billing</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-12 h-6 bg-slate-800 rounded-full p-1 relative flex items-center transition"
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-cyan-400 transition-transform ${
                    isAnnual ? "translate-x-6" : "translate-x-0"
                  }`} 
                />
              </button>
              <span className={`text-sm ${isAnnual ? "text-white font-bold" : "text-slate-400"} flex items-center gap-1.5`}>
                Annual Billing <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Free Tier */}
            <div className="glass-card rounded-[2rem] p-8 border-white/10 flex flex-col justify-between relative hover:border-slate-700 transition duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Starter Account</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">FOR CASUAL WEALTH TRACKING</p>
                </div>
                
                <div className="flex items-baseline text-white">
                  <span className="text-5xl font-extrabold tracking-tight">$0</span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>
                
                <p className="text-slate-400 text-sm">
                  Perfect to get structured, calm visibility into your asset net worth, loan trackers, and basic budgeting.
                </p>

                <div className="border-t border-white/5 pt-6 space-y-3.5 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-cyan-400" />
                    <span>Sync up to 3 bank accounts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-cyan-400" />
                    <span>Basic EMI Loan Calculator</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-cyan-400" />
                    <span>Manual asset value updates</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 line-through">
                    <Check className="h-4 w-4" />
                    <span>AI financial location advice</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="glass-card rounded-[2rem] p-8 border-cyan-500/20 bg-cyan-950/5 flex flex-col justify-between relative shadow-[0_0_40px_rgba(34,211,238,0.05)] hover:border-cyan-400/40 transition duration-300">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-cyan-400 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                RECOMMENDED
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Pro Workspace
                    <Sparkles className="h-4.5 w-4.5 text-cyan-300 animate-pulse" />
                  </h3>
                  <p className="text-xs text-cyan-400 font-semibold mt-1">UNLIMITED WEALTH OPERATING SYSTEM</p>
                </div>
                
                <div className="flex items-baseline text-white">
                  <span className="text-5xl font-extrabold tracking-tight">
                    ${isAnnual ? "12" : "15"}
                  </span>
                  <span className="text-slate-400 text-sm ml-2">/ month</span>
                </div>
                
                <p className="text-slate-400 text-sm">
                  Complete automated financial workspace. Sync all your asset portfolios, liabilities, and leverage advanced AI planning sweeps.
                </p>

                <div className="border-t border-cyan-500/10 pt-6 space-y-3.5 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-cyan-400" />
                    <span className="font-semibold text-white">Unlimited bank synchronizations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-cyan-400" />
                    <span>Real-time cryptocurrency portfolio feeds</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-cyan-400" />
                    <span>Interactive EMI & Compound growth simulators</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-cyan-400" />
                    <span className="text-gradient-cyan-purple font-bold">Uncapped AI Insights sweeps</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link to="/dashboard">
                  <Button className="w-full rounded-full bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 shadow-[0_4px_20px_rgba(34,211,238,0.25)]">
                    Upgrade to Pro Workspace
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ==================================================
            FAQ SECTION
            ================================================== */}
        <section id="faq" ref={faqRef} className="mx-auto max-w-4xl px-6 py-20 lg:px-8 z-10 relative">
          
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
              Frequently Asked Questions
            </h2>
            <p className="text-3xl font-extrabold tracking-tight text-white">
              Everything you need to know.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="glass-card rounded-2xl overflow-hidden border-white/5 transition duration-300 hover:border-white/10"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-semibold text-white focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronRight 
                    className={`h-5 w-5 text-cyan-400 transform transition-transform duration-300 ${
                      openFaq === index ? "rotate-90" : "rotate-0"
                    }`} 
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-6 text-sm leading-relaxed text-slate-400 border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            FINAL CTA ACTION SECTION
            ================================================== */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 z-10 relative">
          <div className="relative rounded-[2.5rem] border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-10 lg:p-16 overflow-hidden shadow-2xl text-center">
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Step into financial peace.
              </h2>
              <p className="text-lg text-slate-300">
                Join thousands of ambitious households running their wealth dashboard with absolute clarity and control.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="rounded-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 transition duration-300 px-10 py-6 text-base shadow-[0_8px_30px_rgba(34,211,238,0.25)] flex items-center group">
                    Create your Account
                    <ArrowUpRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                FREE TO LAUNCH · UPGRADE TO PRO ANYTIME
              </p>
            </div>
          </div>
        </section>
      </Shell>
    </div>
  );
}
