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
  Tooltip as RechartsTooltip,
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
  MessageSquare,
  Check,
  Percent,
  ArrowUpRight,
  Lock,
  Zap,
  Landmark,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Shell } from "../components/layout/shell";

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Trusted Tech Logos (Grayscale & elegant)
const brandLogos = [
  { 
    name: "Asteroid Kit", 
    renderIcon: () => (
      <svg className="w-4 h-4 text-brand-silver/80 group-hover:text-brand-cream transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="8" y1="20" x2="16" y2="4" />
        <line x1="12" y1="20" x2="20" y2="4" />
      </svg>
    ) 
  },
  { 
    name: "Aceternity UI", 
    renderIcon: () => (
      <div className="w-3.5 h-3.5 bg-brand-cream/80 rounded-[3px] flex items-center justify-center text-brand-midnight font-extrabold text-[8px] leading-none group-hover:bg-brand-cream transition">
        A
      </div>
    ) 
  },
  { 
    name: "Gamity", 
    renderIcon: () => (
      <svg className="w-4 h-4 text-brand-silver/80 group-hover:text-brand-cream transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9M12 12l-6.364-6.364M12 12l6.364 6.364M12 12H3m9 0h9m-9 0l-6.364 6.364M12 12l6.364-6.364" />
      </svg>
    ) 
  },
  { 
    name: "Host IT", 
    renderIcon: () => (
      <svg className="w-4 h-4 text-brand-silver/80 group-hover:text-brand-cream transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
      </svg>
    ) 
  }
];

// Infinite Marquee Cards content
const marqueeCards = [
  {
    isWhite: false,
    content: (
      <div className="flex flex-col justify-between h-full text-left">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold tracking-wider text-brand-silver uppercase font-mono">Live Portfolios</span>
            <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h4 className="text-base font-bold tracking-tight text-brand-cream mb-1">Consolidated Wealth Ledger</h4>
          <p className="text-[11px] text-brand-silver/80 leading-relaxed font-sans">
            Auto-sync structures all assets under a clean, secure view.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-[9px] font-mono bg-brand-cream/5 border border-brand-cream/10 rounded-md px-1.5 py-0.5 text-brand-silver">Stocks</span>
          <span className="text-[9px] font-mono bg-brand-cream/5 border border-brand-cream/10 rounded-md px-1.5 py-0.5 text-brand-silver">Crypto</span>
        </div>
      </div>
    )
  },
  {
    isWhite: true,
    content: (
      <div className="flex flex-col justify-between h-full text-left">
        <div>
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-base font-bold tracking-tight text-brand-midnight leading-tight">
              Create your <br />
              financial workspace.
            </h4>
            <div className="w-6 h-6 rounded-full border border-brand-midnight/10 flex items-center justify-center">
              <ChevronRight className="h-3.5 w-3.5 text-brand-midnight" />
            </div>
          </div>
          <p className="text-[11px] text-brand-midnight/80">
            Set up an account to start projecting budgets with standard formulas.
          </p>
        </div>
        <span className="text-[9px] font-bold tracking-wider text-brand-midnight uppercase font-mono">GET STARTED FREE</span>
      </div>
    )
  },
  {
    isWhite: false,
    content: (
      <div className="flex flex-col justify-between h-full text-left">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold tracking-wider text-brand-cobalt-light uppercase font-mono">AI SWEEPING</span>
            <Sparkles className="h-3.5 w-3.5 text-brand-cobalt-light" />
          </div>
          <h4 className="text-base font-bold tracking-tight text-brand-cream mb-1">Interactive Advisor Swarms</h4>
          <p className="text-[11px] text-brand-silver/80 leading-relaxed font-mono">
            $ debt: avalanche_mode active. net yield +1.4%
          </p>
        </div>
        <div className="flex justify-between items-center text-[9px] text-brand-silver/60 font-mono">
          <span>SWEEP OK</span>
          <span>EST. SAVINGS: $14.8K</span>
        </div>
      </div>
    )
  },
  {
    isWhite: true,
    content: (
      <div className="flex flex-col justify-between h-full text-left">
        <div>
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-base font-bold tracking-tight text-brand-midnight leading-tight">
              Interactive <br />
              Simulator Sandbox.
            </h4>
            <div className="w-6 h-6 rounded-full bg-brand-midnight flex items-center justify-center">
              <ChevronRight className="h-3.5 w-3.5 text-brand-cream" />
            </div>
          </div>
          <p className="text-[11px] text-brand-midnight/85">
            Test growth projections and loan calculators with instant plotting.
          </p>
        </div>
        <span className="text-[9px] font-bold tracking-wider text-brand-midnight uppercase font-mono">TRY SANDBOX NOW</span>
      </div>
    )
  },
  {
    isWhite: false,
    content: (
      <div className="flex flex-col justify-between h-full text-left">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold tracking-wider text-brand-cobalt-light uppercase font-mono">LOAN OPTIMIZATION</span>
            <TrendingUp className="h-3.5 w-3.5 text-brand-cobalt-light" />
          </div>
          <h4 className="text-base font-bold tracking-tight text-brand-cream mb-1">Interest Minimizer</h4>
          <p className="text-[11px] text-brand-silver/80 leading-relaxed">
            Visually balance loan amounts and interest rates to optimize payoffs.
          </p>
        </div>
        <div>
          <div className="h-1 w-full bg-brand-cream/10 rounded-full overflow-hidden">
            <div className="h-full bg-brand-cobalt rounded-full" style={{ width: "65%" }} />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-brand-silver mt-1">
            <span>65% INTEREST CUT</span>
            <span>$12.5K SAVED</span>
          </div>
        </div>
      </div>
    )
  },
  {
    isWhite: false,
    content: (
      <div className="flex flex-col justify-between h-full text-left">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase font-mono">Vault Security</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <h4 className="text-base font-bold tracking-tight text-brand-cream mb-1">SOC 2 Type II Certified</h4>
          <p className="text-[11px] text-brand-silver/80 leading-relaxed">
            Bank-grade AES-256 data protection and encrypted access.
          </p>
        </div>
        <div className="flex gap-4 text-[9px] text-brand-silver/70 font-mono font-semibold">
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-400" /> ENCRYPTED</span>
          <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-400" /> READ-ONLY</span>
        </div>
      </div>
    )
  }
];

export function HomePage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const sandboxRef = useRef(null);
  const faqRef = useRef(null);

  // Background Ambient Glow Movement
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
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );

      // Feature cards stagger reveal
      gsap.fromTo(
        ".feature-card-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
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
    { name: "Principal", value: Math.round(P), color: "#2b5cb8" },
    { name: "Interest", value: Math.round(totalInterest), color: "#8c9cb3" },
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
      response: "With $150,000 active liability at 6.5%, implementing the Avalanche method is recommended. Accelerating with an extra $350 monthly saves $14,820 in interest and decreases tenure by 3.2 years. We configured this ruleset in your account dashboard.",
    },
    {
      id: "tax",
      label: "Asset Location for Tax Efficiency",
      response: "Your asset placement analysis highlights 64% high-growth equities inside standard brokerage accounts. Shift high-yield funds to tax-advantaged buckets while keeping broad index ETFs in taxable space. Projected long-term yield gain: +1.4% annually.",
    },
    {
      id: "home",
      label: "Verify Real Estate Purchase Feasibility",
      response: "Target purchase of $650,000 with 20% down ($130,000) leaves post-purchase liquidity reserves at 8.4 months of living expenses. Cash reserves adequately support the monthly mortgage flow of $3,420 at current benchmarks. Purchase model is sustainable.",
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
    }, 10);
  };



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
      answer: "No, the AI Insights engine offers analytical modeling and projection tools based on mathematical simulations and historical data. It does not replace professional tax or advisory services.",
    },
  ];

  // Custom tooltips to match Cobalt/Cream theme
  const CustomRechartsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-brand-cream/10 bg-brand-midnight-card px-3 py-2 text-xs font-mono shadow-2xl">
          <p className="text-brand-silver font-bold uppercase">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-brand-cream mt-0.5" style={{ color: entry.color }}>
              {entry.name}: ${Number(entry.value).toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} className="bg-brand-midnight min-h-screen relative overflow-hidden font-sans text-brand-cream selection:bg-brand-cobalt/40">
      
      {/* Ambient mouse glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-transform duration-300 ease-out opacity-20"
        style={{
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(43, 92, 184, 0.25), transparent 80%),
                       radial-gradient(400px circle at ${mousePos.x + 150}px ${mousePos.y - 150}px, rgba(140, 156, 179, 0.1), transparent 80%)`
        }}
      />

      <Shell>
        {/* ==================================================
            HERO SECTION (Editorial Manifesto Hero)
            ================================================== */}
        <section ref={heroRef} className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 flex flex-col items-start text-left z-10">
          {/* Eyebrow tag */}
          <div className="hero-reveal flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cobalt" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-cobalt-light font-mono">
              FINVEST WORKSPACE
            </span>
          </div>

          {/* Large Headline */}
          <h1 className="hero-reveal text-4xl sm:text-6xl lg:text-7.5xl font-extrabold tracking-tight leading-[1.05] text-brand-cream max-w-4xl">
            Clear, calm, complete control <br />
            over your capital.
          </h1>

          {/* Subtitle */}
          <p className="hero-reveal max-w-2xl text-base sm:text-lg text-brand-silver leading-relaxed mt-6 font-medium">
            No fragmented ledger sheets. No complex setups. Finvest consolidates your global assets, liabilities, and monthly cash flows into a single, high-fidelity wealth interface.
          </p>

          {/* Action CTAs */}
          <div className="hero-reveal flex flex-wrap items-center gap-4 mt-8">
            <Link to="/dashboard">
              <Button size="lg" className="bg-brand-cream text-brand-midnight hover:bg-brand-cream/90 font-bold px-8 shadow-lg shadow-brand-cobalt/10">
                Launch Workspace
              </Button>
            </Link>
            <a href="#sandbox">
              <Button size="lg" variant="ghost" className="font-semibold text-brand-cream hover:bg-brand-cream/5 flex items-center gap-1.5">
                Simulate Sandbox <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>

          {/* Minimalist Grayscale Brand List */}
          <div className="hero-reveal mt-20 pt-8 border-t border-brand-cream/5 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <p className="text-[10px] font-bold tracking-[0.2em] text-brand-silver/50 uppercase font-mono">
                INTEGRATED INFRASTRUCTURE
              </p>
              <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-60">
                {brandLogos.map((logo, idx) => (
                  <div key={idx} className="flex items-center gap-2 group cursor-default">
                    {logo.renderIcon()}
                    <span className="text-xs font-bold text-brand-silver group-hover:text-brand-cream transition tracking-tight">
                      {logo.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            FEATURES MARQUEE SECTION
            ================================================== */}
        <section id="features" className="relative w-full overflow-hidden py-10 border-y border-brand-cream/5 bg-brand-midnight-card/10 z-10">
          <div className="flex gap-6 animate-marquee-scroll">
            {/* First loop of cards */}
            {marqueeCards.map((card, index) => (
              <div 
                key={`marquee-1-${index}`} 
                className={`w-[290px] h-[190px] shrink-0 rounded-xl p-5 flex flex-col justify-between border transition duration-300 ${
                  card.isWhite 
                    ? "bg-brand-cream text-brand-midnight border-brand-cream" 
                    : "bg-brand-midnight-card/85 text-brand-cream border-brand-cream/5 hover:border-brand-cobalt/30"
                }`}
              >
                {card.content}
              </div>
            ))}
            {/* Second loop of cards for seamless scroll */}
            {marqueeCards.map((card, index) => (
              <div 
                key={`marquee-2-${index}`} 
                className={`w-[290px] h-[190px] shrink-0 rounded-xl p-5 flex flex-col justify-between border transition duration-300 ${
                  card.isWhite 
                    ? "bg-brand-cream text-brand-midnight border-brand-cream" 
                    : "bg-brand-midnight-card/85 text-brand-cream border-brand-cream/5 hover:border-brand-cobalt/30"
                }`}
              >
                {card.content}
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            INTERACTIVE SANDBOX PLAYGROUND SECTION
            ================================================== */}
        <section id="sandbox" ref={sandboxRef} className="mx-auto max-w-7xl px-6 py-24 lg:px-8 z-10 relative">
          
          <div className="max-w-3xl mb-16 space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-cobalt-light font-mono">
              FINANCIAL SANDBOX
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-cream">
              Simulate compound state curves.
            </p>
            <p className="text-base text-brand-silver leading-relaxed">
              Interact with compounding formulas, simulate interest margins, and preview the algorithms driving Finvest.
            </p>
          </div>

          {/* Sandbox Main Container Grid */}
          <div className="glass-card rounded-2xl border-brand-cream/5 overflow-hidden grid lg:grid-cols-[240px_1fr]">
            
            {/* Sidebar Tab Selectors */}
            <div className="bg-brand-midnight-card/35 p-5 border-b lg:border-b-0 lg:border-r border-brand-cream/5 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
              <button 
                onClick={() => setActiveTab("emi")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 font-semibold text-xs whitespace-nowrap ${
                  activeTab === "emi" 
                    ? "bg-brand-cobalt/15 text-brand-cream border border-brand-cobalt/25"
                    : "text-brand-silver hover:text-brand-cream border border-transparent"
                }`}
              >
                <Percent className="h-4 w-4 text-brand-cobalt-light" />
                EMI Loan Planner
              </button>
              
              <button 
                onClick={() => setActiveTab("compound")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 font-semibold text-xs whitespace-nowrap ${
                  activeTab === "compound" 
                    ? "bg-brand-cobalt/15 text-brand-cream border border-brand-cobalt/25"
                    : "text-brand-silver hover:text-brand-cream border border-transparent"
                }`}
              >
                <TrendingUp className="h-4 w-4 text-brand-cobalt-light" />
                Compound Growth
              </button>

              <button 
                onClick={() => setActiveTab("ai")}
                className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center gap-3 font-semibold text-xs whitespace-nowrap ${
                  activeTab === "ai" 
                    ? "bg-brand-cobalt/15 text-brand-cream border border-brand-cobalt/25"
                    : "text-brand-silver hover:text-brand-cream border border-transparent"
                }`}
              >
                <BrainCircuit className="h-4 w-4 text-brand-cobalt-light" />
                AI Insights Chat
              </button>
            </div>

            {/* Content Display Panels */}
            <div className="p-6 lg:p-10 bg-brand-midnight-card/10 min-h-[440px]">
              
              <AnimatePresence mode="wait">
                {/* 1. EMI CALCULATOR PANEL */}
                {activeTab === "emi" && (
                  <motion.div 
                    key="emi"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8"
                  >
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-brand-cobalt-light font-mono">TOOL PREVIEW</span>
                        <h3 className="text-xl font-bold text-brand-cream">Mortgage Repayment Calculator</h3>
                        <p className="text-xs text-brand-silver leading-relaxed">Calculate monthly outflows and principal-to-interest ratios.</p>
                      </div>

                      {/* Slider 1: Loan Amount */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-brand-silver">Loan Principal</span>
                          <span className="text-brand-cream font-mono">${loanAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        </div>
                        <input 
                          type="range" 
                          min="10000" 
                          max="1000000" 
                          step="5000"
                          value={loanAmount} 
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-full h-1 bg-brand-cream/10 rounded-lg appearance-none cursor-pointer accent-brand-cobalt"
                        />
                      </div>

                      {/* Slider 2: Interest Rate */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-brand-silver">Annual Interest Rate</span>
                          <span className="text-brand-cream font-mono">{loanRate}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="15" 
                          step="0.1"
                          value={loanRate} 
                          onChange={(e) => setLoanRate(Number(e.target.value))}
                          className="w-full h-1 bg-brand-cream/10 rounded-lg appearance-none cursor-pointer accent-brand-cobalt"
                        />
                      </div>

                      {/* Slider 3: Tenure */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-brand-silver">Repayment Period</span>
                          <span className="text-brand-cream font-mono">{loanTenure} Years</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="30" 
                          step="1"
                          value={loanTenure} 
                          onChange={(e) => setLoanTenure(Number(e.target.value))}
                          className="w-full h-1 bg-brand-cream/10 rounded-lg appearance-none cursor-pointer accent-brand-cobalt"
                        />
                      </div>

                      {/* Outflows summary */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-cream/5">
                        <div className="p-3 bg-brand-cream/5 rounded-xl border border-brand-cream/5">
                          <span className="text-[9px] uppercase text-brand-silver font-bold font-mono">Monthly EMI</span>
                          <p className="text-lg font-bold text-brand-cream mt-1 font-mono">${Math.round(emi).toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-brand-cream/5 rounded-xl border border-brand-cream/5">
                          <span className="text-[9px] uppercase text-brand-silver font-bold font-mono">Payable Interest</span>
                          <p className="text-lg font-bold text-brand-silver mt-1 font-mono">${Math.round(totalInterest).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Chart Showcase column */}
                    <div className="flex flex-col items-center justify-center p-6 bg-brand-midnight-card/45 rounded-xl border border-brand-cream/5">
                      <span className="text-[9px] text-brand-silver font-bold uppercase font-mono mb-4">PRINCIPAL VS INTEREST SHARE</span>
                      <div className="w-[140px] h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={emiPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={64}
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
                      
                      <div className="mt-5 space-y-2 w-full text-xs font-mono">
                        <div className="flex items-center justify-between text-brand-silver">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-brand-cobalt" />
                            <span>Principal</span>
                          </div>
                          <span className="font-bold text-brand-cream">${Math.round(loanAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-brand-silver">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-brand-silver" />
                            <span>Total Interest</span>
                          </div>
                          <span className="font-bold text-brand-cream">${Math.round(totalInterest).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. COMPOUND INTEREST PANEL */}
                {activeTab === "compound" && (
                  <motion.div 
                    key="compound"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8"
                  >
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-brand-cobalt-light font-mono">TOOL PREVIEW</span>
                        <h3 className="text-xl font-bold text-brand-cream">Compounding Projection Builder</h3>
                        <p className="text-xs text-brand-silver leading-relaxed">Map compounding margins over variable timelines.</p>
                      </div>

                      {/* Slider 1: Monthly Savings */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-brand-silver">Monthly Contribution</span>
                          <span className="text-brand-cream font-mono">${monthlySavings.toLocaleString()}/mo</span>
                        </div>
                        <input 
                          type="range" 
                          min="100" 
                          max="10000" 
                          step="100"
                          value={monthlySavings} 
                          onChange={(e) => setMonthlySavings(Number(e.target.value))}
                          className="w-full h-1 bg-brand-cream/10 rounded-lg appearance-none cursor-pointer accent-brand-cobalt"
                        />
                      </div>

                      {/* Slider 2: Rate */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-brand-silver">Expected Return Rate</span>
                          <span className="text-brand-cream font-mono">{returnRate}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="2" 
                          max="15" 
                          step="0.1"
                          value={returnRate} 
                          onChange={(e) => setReturnRate(Number(e.target.value))}
                          className="w-full h-1 bg-brand-cream/10 rounded-lg appearance-none cursor-pointer accent-brand-cobalt"
                        />
                      </div>

                      {/* Slider 3: Period */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-brand-silver">Horizon Length</span>
                          <span className="text-brand-cream font-mono">{periodYears} Years</span>
                        </div>
                        <input 
                          type="range" 
                          min="5" 
                          max="40" 
                          step="1"
                          value={periodYears} 
                          onChange={(e) => setPeriodYears(Number(e.target.value))}
                          className="w-full h-1 bg-brand-cream/10 rounded-lg appearance-none cursor-pointer accent-brand-cobalt"
                        />
                      </div>

                      {/* Outflows summary */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-cream/5">
                        <div className="p-3 bg-brand-cream/5 rounded-xl border border-brand-cream/5">
                          <span className="text-[9px] uppercase text-brand-silver font-bold font-mono">Total Paid</span>
                          <p className="text-lg font-bold text-brand-cream mt-1 font-mono">${Math.round(totalContributions).toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-brand-cream/5 rounded-xl border border-brand-cream/5">
                          <span className="text-[9px] uppercase text-brand-silver font-bold font-mono">Ending Balance</span>
                          <p className="text-lg font-bold text-brand-cobalt-light mt-1 font-mono">${Math.round(balance).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Chart Projections area chart */}
                    <div className="p-4 bg-brand-midnight-card/45 rounded-xl border border-brand-cream/5 flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] text-brand-silver font-bold uppercase font-mono">GROWTH CURVE</span>
                        <div className="flex gap-3 text-[10px] font-mono">
                          <span className="flex items-center gap-1 text-brand-silver">
                            <div className="w-2 h-2 rounded-sm bg-brand-silver" /> Contrib.
                          </span>
                          <span className="flex items-center gap-1 text-brand-cobalt-light">
                            <div className="w-2 h-2 rounded-sm bg-brand-cobalt" /> Growth
                          </span>
                        </div>
                      </div>

                      <div className="h-[150px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={growthData}>
                            <CartesianGrid vertical={false} stroke="rgba(251,250,247,0.03)" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#8c9cb3", fontSize: 9 }} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `$${Math.round(val/1000)}k`} tick={{ fill: "#8c9cb3", fontSize: 9 }} />
                            <RechartsTooltip content={<CustomRechartsTooltip />} />
                            <Area type="monotone" dataKey="Contributions" stroke="#8c9cb3" fillOpacity={0.05} fill="#8c9cb3" strokeWidth={1} />
                            <Area type="monotone" dataKey="Total" stroke="#2b5cb8" fillOpacity={0.1} fill="#2b5cb8" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. AI FINANCIAL ADVISORY SIMULATOR */}
                {activeTab === "ai" && (
                  <motion.div 
                    key="ai"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8"
                  >
                    <div className="space-y-5 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-brand-cobalt-light font-mono font-bold">AI WIDGET</span>
                        <h3 className="text-xl font-bold text-brand-cream">Decision Analysis Sweeps</h3>
                        <p className="text-xs text-brand-silver leading-relaxed">Trigger mathematical simulations for debt, tax, and property scenarios.</p>
                      </div>

                      <div className="space-y-2.5">
                        <p className="text-[9px] text-brand-silver font-bold uppercase font-mono">SIMULATION MODELS:</p>
                        <div className="grid gap-2">
                          {aiPrompts.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handlePromptSelect(p)}
                              className={`w-full text-left p-3 rounded-lg border transition text-xs font-semibold font-mono ${
                                selectedPrompt === p.id 
                                  ? "bg-brand-cobalt/15 text-brand-cream border-brand-cobalt/30"
                                  : "bg-brand-cream/5 text-brand-silver border-brand-cream/5 hover:bg-brand-cream/10"
                              }`}
                            >
                              &gt; {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Output Terminal Console */}
                    <div className="flex flex-col h-[280px] bg-brand-midnight-card/45 rounded-xl border border-brand-cream/5 overflow-hidden">
                      <div className="bg-brand-midnight-card/85 px-4 py-2.5 border-b border-brand-cream/5 flex items-center justify-between text-[10px] text-brand-silver font-bold font-mono">
                        <span>CONSOLE LOG</span>
                        <span className="text-brand-cobalt-light animate-pulse">SYSTEM OK</span>
                      </div>

                      <div className="p-4 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-3">
                        {selectedPrompt ? (
                          <div className="space-y-2">
                            <div className="text-brand-silver/50">&gt; initialising parameter sweep...</div>
                            <div className="text-brand-cobalt-light">&gt; algorithm response compiled:</div>
                            <div className="text-brand-cream border-l border-brand-cobalt/40 pl-2.5">
                              {aiTyping}
                              {isTyping && <span className="animate-pulse bg-brand-cobalt inline-block w-1.5 h-3 ml-1" />}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center text-brand-silver/50 space-y-2">
                            <MessageSquare className="h-6 w-6 text-brand-silver/30" />
                            <p className="text-[10px]">Select a simulation model prompt on the left to review parsed AI output.</p>
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
        <section id="product" ref={featuresRef} className="mx-auto max-w-7xl px-6 py-24 lg:px-8 z-10 relative border-t border-brand-cream/5">
          
          <div className="max-w-3xl mb-16 space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-cobalt-light font-mono">
              PLATFORM DESIGN
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-cream">
              Clean architecture. Zero compromise.
            </p>
            <p className="text-base text-brand-silver leading-relaxed">
              Every card, query hook, and calculations block is designed to give you absolute clarity.
            </p>
          </div>

          {/* Premium Bento Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Box 1: Live Cashflow */}
            <div className="feature-card-item glass-card rounded-2xl p-8 border-brand-cream/5 md:col-span-2 flex flex-col justify-between group hover:border-brand-cobalt/30 transition duration-300 min-h-[280px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-cobalt/10 border border-brand-cobalt/20 text-brand-cobalt-light flex items-center justify-center mb-6">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-brand-cream mb-3">Automated Cash Flow Audits</h3>
                <p className="text-brand-silver text-sm max-w-xl leading-relaxed">
                  Automatically parse monthly income parameters, subscription footprints, and investment transfers. Finvest maps out your allocations dashboard without manual bookkeeping.
                </p>
              </div>
              <div className="flex flex-wrap gap-6 mt-8 text-[10px] text-brand-silver/65 font-bold font-mono">
                <span>PLAID SYNCED</span>
                <span>REAL-TIME ANALYSIS</span>
                <span>CLEAN MAPPING</span>
              </div>
            </div>

            {/* Box 2: Goal projections */}
            <div className="feature-card-item glass-card rounded-2xl p-8 border-brand-cream/5 flex flex-col justify-between group hover:border-brand-cobalt/30 transition duration-300 min-h-[280px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-cobalt/10 border border-brand-cobalt/20 text-brand-cobalt-light flex items-center justify-center mb-6">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-brand-cream mb-3">Milestone Curves</h3>
                <p className="text-brand-silver text-sm leading-relaxed">
                  Map compound trajectories for real estate transactions, early retirements, or liquid fund allocations.
                </p>
              </div>
              <div className="flex gap-2 mt-6 justify-between items-center text-xs font-semibold text-brand-cobalt-light font-mono">
                <span>PROJECT TIMELINES</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Box 3: Security & Encryption */}
            <div className="feature-card-item glass-card rounded-2xl p-8 border-brand-cream/5 flex flex-col justify-between group hover:border-brand-cobalt/30 transition duration-300 min-h-[280px]">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-cobalt/10 border border-brand-cobalt/20 text-brand-cobalt-light flex items-center justify-center mb-6">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-brand-cream mb-3">Bank-Grade Isolation</h3>
                <p className="text-brand-silver text-sm leading-relaxed">
                  Protected by SOC 2 Type II controls, active AES-256 databases, and secure read-only tokenization parameters.
                </p>
              </div>
              <div className="flex gap-2 mt-6 justify-between items-center text-xs font-semibold text-emerald-400 font-mono">
                <span>SOC 2 AUDITED</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Box 4: Pure CSS/SVG Mockup Showcase */}
            <div className="feature-card-item glass-card rounded-2xl p-8 border-brand-cream/5 md:col-span-2 flex flex-col lg:flex-row gap-8 items-center justify-between group hover:border-brand-cobalt/30 transition duration-300 min-h-[280px]">
              <div className="space-y-4 max-w-sm">
                <h3 className="text-xl font-bold text-brand-cream">Consolidated Asset Vault</h3>
                <p className="text-brand-silver text-sm leading-relaxed">
                  Unify traditional, crypto, and properties assets. Balance asset classes, monitor diversification limits, and trigger automated balance reviews.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[9px] font-mono bg-brand-cream/5 border border-brand-cream/10 rounded-md px-2 py-0.5 text-brand-cream">Stocks</span>
                  <span className="text-[9px] font-mono bg-brand-cream/5 border border-brand-cream/10 rounded-md px-2 py-0.5 text-brand-cream">Real Estate</span>
                  <span className="text-[9px] font-mono bg-brand-cream/5 border border-brand-cream/10 rounded-md px-2 py-0.5 text-brand-cream">Crypto</span>
                </div>
              </div>
              
              {/* Premium Pure CSS Mockup Card */}
              <div className="relative w-full max-w-[250px] h-[150px] rounded-xl overflow-hidden bg-gradient-to-br from-brand-cobalt to-brand-midnight-card border border-brand-cream/10 p-5 flex flex-col justify-between shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cream/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-cream/20 bg-brand-cream/10">
                    <Landmark className="h-3.5 w-3.5 text-brand-cream"/>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-brand-cream/50">VAULT CARD</span>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-brand-cream/60">CONSOLIDATED VALUE</p>
                  <p className="text-lg font-bold tracking-tight text-brand-cream font-mono">$842,500.00</p>
                </div>
              </div>
            </div>

          </div>
        </section>



        {/* ==================================================
            FAQ SECTION
            ================================================== */}
        <section id="faq" ref={faqRef} className="mx-auto max-w-4xl px-6 py-24 lg:px-8 z-10 relative border-t border-brand-cream/5">
          
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-cobalt-light font-mono">
              COMMON QUESTIONS
            </h2>
            <p className="text-3xl font-extrabold tracking-tight text-brand-cream">
              Frequently asked questions.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="glass-card rounded-xl overflow-hidden border-brand-cream/5 transition duration-200 hover:border-brand-cream/10"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-semibold text-brand-cream focus:outline-none text-sm"
                >
                  <span>{faq.question}</span>
                  <ChevronRight 
                    className={`h-4.5 w-4.5 text-brand-cobalt-light transform transition-transform duration-200 ${
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
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 text-xs leading-relaxed text-brand-silver border-t border-brand-cream/5 pt-4">
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
          <div className="relative rounded-2xl border border-brand-cobalt/25 bg-gradient-to-br from-brand-midnight via-brand-midnight-card to-brand-cobalt/10 p-10 lg:p-16 overflow-hidden shadow-2xl text-center">
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-cobalt/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-cream">
                Achieve complete capital clarity.
              </h2>
              <p className="text-sm text-brand-silver leading-relaxed">
                Join thousands of design-conscious builders running their asset ledger with absolute confidence.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="rounded-lg bg-brand-cream text-brand-midnight font-bold hover:bg-brand-cream/90 transition px-8 py-5 text-sm flex items-center group shadow-xl shadow-brand-cobalt/5">
                    Launch your Account
                    <ArrowUpRight className="ml-2 h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>

              <p className="text-[9px] text-brand-silver/50 font-bold tracking-wider uppercase font-mono">
                FREE UNTIL YOU READY · UPGRADE TO PRO ANYTIME
              </p>
            </div>
          </div>
        </section>
      </Shell>
    </div>
  );
}
