import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../providers/auth-provider";
import { Button } from "../ui/button";
import { Landmark, Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
export function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const { signIn, signUp } = useAuth();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, reset: resetLoginForm, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const { register: registerSignup, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors }, reset: resetSignupForm, } = useForm({
        resolver: zodResolver(signupSchema),
    });
    const onLogin = async (data) => {
        setIsLoading(true);
        setError(null);
        const res = await signIn(data.email, data.password);
        setIsLoading(false);
        if (res.error) {
            setError(res.error);
        }
    };
    const onSignup = async (data) => {
        setIsLoading(true);
        setError(null);
        const res = await signUp(data.name, data.email, data.password);
        setIsLoading(false);
        if (res.error) {
            setError(res.error);
        }
    };
    const handleDemoLogin = async () => {
        setIsLoading(true);
        setError(null);
        // Offline / Demo account login
        const res = await signIn("user@finvest.com", "password123");
        setIsLoading(false);
        if (res.error) {
            setError(res.error);
        }
    };
    return (<div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(167,139,250,0.12),_transparent_35%),linear-gradient(135deg,_#020617,_#0f172a_32%,_#111827)] p-4 text-slate-100">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 opacity-30 pointer-events-none"/>
        
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 shadow-[0_12px_40px_rgba(34,211,238,0.18)]">
            <Landmark className="h-6 w-6 text-cyan-300"/>
          </div>
          <span className="text-sm font-semibold tracking-[0.3em] text-slate-300 uppercase">Finvest</span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-sm text-slate-400">
            {isLogin ? "Log in to access your wealth workspace" : "Get started with premium financial intelligence"}
          </p>
        </div>

        {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
            {error}
          </motion.div>)}

        <AnimatePresence mode="wait">
          {isLogin ? (<motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...registerLogin("email")} type="email" placeholder="name@company.com" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {loginErrors.email && (<p className="text-xs text-red-400">{loginErrors.email.message}</p>)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...registerLogin("password")} type="password" placeholder="••••••••" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {loginErrors.password && (<p className="text-xs text-red-400">{loginErrors.password.message}</p>)}
              </div>

              <Button type="submit" className="w-full py-6 rounded-2xl font-semibold mt-6" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in to workspace"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4"/>}
              </Button>
            </motion.form>) : (<motion.form key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} onSubmit={handleSignupSubmit(onSignup)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Full name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...registerSignup("name")} type="text" placeholder="Alex Morgan" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {signupErrors.name && (<p className="text-xs text-red-400">{signupErrors.name.message}</p>)}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...registerSignup("email")} type="email" placeholder="name@company.com" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {signupErrors.email && (<p className="text-xs text-red-400">{signupErrors.email.message}</p>)}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/>
                  <input {...registerSignup("password")} type="password" placeholder="••••••••" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"/>
                </div>
                {signupErrors.password && (<p className="text-xs text-red-400">{signupErrors.password.message}</p>)}
              </div>

              <Button type="submit" className="w-full py-6 rounded-2xl font-semibold mt-6" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4"/>}
              </Button>
            </motion.form>)}
        </AnimatePresence>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-500 font-medium uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button type="button" onClick={handleDemoLogin} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15" disabled={isLoading}>
          <Sparkles className="h-4 w-4"/>
          Access offline workspace (Demo mode)
        </button>

        <div className="mt-6 text-center text-sm">
          <button type="button" onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            resetLoginForm();
            resetSignupForm();
        }} className="text-slate-400 hover:text-white transition">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-500 border-t border-white/5 pt-4">
          <ShieldCheck className="h-4 w-4 text-emerald-400/80"/>
          SOC-2 compliant client-side data isolation
        </div>
      </div>
    </div>);
}
