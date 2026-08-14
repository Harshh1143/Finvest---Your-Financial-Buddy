import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../providers/auth-provider";
import { Button } from "../ui/button";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
            toast.error(res.error);
        } else {
            toast.success("Successfully logged in!");
        }
    };

    const onSignup = async (data) => {
        setIsLoading(true);
        setError(null);
        const res = await signUp(data.name, data.email, data.password);
        setIsLoading(false);
        if (res.error) {
            setError(res.error);
            toast.error(res.error);
        } else {
            toast.success("Account created successfully!");
        }
    };

    const handleDemoLogin = async () => {
        setIsLoading(true);
        setError(null);
        const res = await signIn("user@finvest.com", "password123");
        setIsLoading(false);
        if (res.error) {
            setError(res.error);
            toast.error(res.error);
        } else {
            toast.success("Logged in as Demo User!");
        }
    };

    const handleSocialClick = (provider) => {
        toast.info(`${provider} integration is a demo placeholder. Please use email login or Demo Mode.`);
    };

    return (
        <div className="flex min-h-screen w-full bg-brand-midnight text-brand-cream font-sans selection:bg-brand-cobalt/30 selection:text-brand-cream">
            {/* Left Pane: Form Container */}
            <div className="flex w-full md:w-1/2 lg:w-[55%] flex-col justify-between p-6 sm:p-10 md:p-16 min-h-screen overflow-y-auto">
                {/* Logo & Navigation Bar */}
                <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-brand-cream" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="4" y="4" width="8.5" height="8.5" rx="2" />
                        <rect x="11.5" y="11.5" width="8.5" height="8.5" rx="2" />
                    </svg>
                    <span className="font-bold text-base tracking-[0.25em] text-brand-cream font-mono">FINVEST</span>
                </div>

                {/* Main Auth Form Box */}
                <div className="mx-auto w-full max-w-[420px] py-12 md:py-16 space-y-8">
                    <div className="space-y-3">
                        <h1 className="text-3xl font-extrabold tracking-tight text-brand-cream">
                            {isLogin ? "Welcome back" : "Create your account"}
                        </h1>
                        <p className="text-xs text-brand-silver leading-relaxed font-medium">
                            {isLogin 
                                ? "We empower individuals to plan, track, and grow their wealth with modern intelligent financial tools." 
                                : "Join Finvest today to start tracking, managing, and optimizing your wealth in one unified platform."}
                        </p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -8 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center text-xs text-red-400 font-mono"
                        >
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.form 
                                key="login" 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -5 }} 
                                transition={{ duration: 0.2 }} 
                                onSubmit={handleLoginSubmit(onLogin)} 
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver">Email</label>
                                    <input 
                                        {...registerLogin("email")} 
                                        type="email" 
                                        placeholder="youremail@yourdomain.com" 
                                        className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 px-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt"
                                        disabled={isLoading}
                                    />
                                    {loginErrors.email && (
                                        <p className="text-xs text-red-400 mt-1">{loginErrors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver">Password</label>
                                    <input 
                                        {...registerLogin("password")} 
                                        type="password" 
                                        placeholder="••••••••" 
                                        className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 px-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt"
                                        disabled={isLoading}
                                    />
                                    {loginErrors.password && (
                                        <p className="text-xs text-red-400 mt-1">{loginErrors.password.message}</p>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full py-3.5 bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin text-brand-midnight" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="signup" 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -5 }} 
                                transition={{ duration: 0.2 }} 
                                onSubmit={handleSignupSubmit(onSignup)} 
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver">Full name</label>
                                    <input 
                                        {...registerSignup("name")} 
                                        type="text" 
                                        placeholder="Alex Morgan" 
                                        className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 px-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt"
                                        disabled={isLoading}
                                    />
                                    {signupErrors.name && (
                                        <p className="text-xs text-red-400 mt-1">{signupErrors.name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver">Email</label>
                                    <input 
                                        {...registerSignup("email")} 
                                        type="email" 
                                        placeholder="youremail@yourdomain.com" 
                                        className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 px-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt"
                                        disabled={isLoading}
                                    />
                                    {signupErrors.email && (
                                        <p className="text-xs text-red-400 mt-1">{signupErrors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-silver">Password</label>
                                    <input 
                                        {...registerSignup("password")} 
                                        type="password" 
                                        placeholder="Create a password" 
                                        className="w-full rounded-lg border border-brand-cream/10 bg-brand-cream/5 py-3.5 px-4 text-xs text-brand-cream placeholder-brand-silver/30 outline-none transition focus:border-brand-cobalt"
                                        disabled={isLoading}
                                    />
                                    {signupErrors.password && (
                                        <p className="text-xs text-red-400 mt-1">{signupErrors.password.message}</p>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full py-3.5 bg-brand-cream hover:bg-brand-cream/90 text-brand-midnight font-bold rounded-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin text-brand-midnight" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Sign up"
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Social Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-brand-cream/5" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-brand-midnight px-2 text-brand-silver font-bold tracking-widest font-mono">or</span>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => handleSocialClick("Google")}
                            className="flex items-center justify-center py-3 bg-brand-cream/5 hover:bg-brand-cream/10 border border-brand-cream/10 rounded-lg transition duration-200 cursor-pointer"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialClick("Facebook")}
                            className="flex items-center justify-center py-3 bg-brand-cream/5 hover:bg-brand-cream/10 border border-brand-cream/10 rounded-lg transition duration-200 cursor-pointer"
                        >
                            <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialClick("Apple")}
                            className="flex items-center justify-center py-3 bg-brand-cream/5 hover:bg-brand-cream/10 border border-brand-cream/10 rounded-lg transition duration-200 cursor-pointer"
                        >
                            <svg className="h-4 w-4 text-brand-cream" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.63.73-1.18 1.87-1.03 2.97 1.12.09 2.27-.56 2.98-1.41z"/>
                            </svg>
                        </button>
                    </div>

                    {/* Form Toggle Link */}
                    <div className="text-center text-xs">
                        <button 
                            type="button" 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                                resetLoginForm();
                                resetSignupForm();
                            }} 
                            className="text-brand-silver hover:text-brand-cream transition duration-200 cursor-pointer"
                        >
                            {isLogin ? (
                                <>
                                    Don't have an account? <span className="text-brand-cobalt-light font-bold hover:underline">Sign up</span>
                                </>
                            ) : (
                                <>
                                    Already have an account? <span className="text-brand-cobalt-light font-bold hover:underline">Sign in</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Subtle Demo Login Button */}
                    <button 
                        type="button" 
                        onClick={handleDemoLogin} 
                        className="w-full text-center text-xs text-brand-silver/60 hover:text-brand-cream transition duration-200 mt-2 underline decoration-brand-cream/10 cursor-pointer font-mono"
                        disabled={isLoading}
                    >
                        Access offline workspace (Demo mode)
                    </button>
                </div>

                {/* Footer Security Notice */}
                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] text-brand-silver/50 mt-8 pt-4 border-t border-brand-cream/5 font-mono">
                    <ShieldCheck className="h-4 w-4 text-emerald-500/80"/>
                    <span>SOC-2 compliant client-side data isolation</span>
                </div>
            </div>

            {/* Right Pane: Premium Asset Display */}
            <div className="relative hidden w-1/2 flex-col justify-between p-12 md:flex lg:w-[45%] h-screen overflow-hidden bg-brand-midnight">
                {/* Decorative Canvas Wrapper */}
                <div className="absolute inset-4 rounded-2xl overflow-hidden bg-brand-midnight-card border border-brand-cream/5 flex flex-col justify-between p-10">
                    {/* Glowing Mesh Gradients */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-cobalt/15 blur-[100px] pointer-events-none" />
                    
                    {/* Minimal Grid Layer */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(251,250,247,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(251,250,247,0.01)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

                    {/* Abstract Interactive/Floating Dashboard Mockups */}
                    <div className="relative flex-grow flex items-center justify-center opacity-90 scale-95 lg:scale-100 transition-all select-none">
                        <div className="relative w-full max-w-sm h-[320px]">
                            {/* Card 1: Main Balance Chart (Renders on Top) */}
                            <motion.div
                                initial={{ y: 20, opacity: 0, rotate: -2 }}
                                animate={{ y: 0, opacity: 1, rotate: -3 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="absolute -top-6 -left-8 w-64 bg-brand-midnight/90 backdrop-blur-xl border border-brand-cream/10 rounded-2xl p-5 shadow-2xl z-20"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] text-brand-silver font-bold uppercase tracking-wider">Net Worth</span>
                                    <span className="text-[9px] bg-brand-cobalt/10 text-brand-cream font-bold px-2 py-0.5 rounded-full border border-brand-cobalt/20 font-mono">+14.2%</span>
                                </div>
                                <div className="text-xl font-bold text-brand-cream mb-4 font-mono">$324,850.00</div>
                                
                                {/* SVG Sparkline Chart */}
                                <svg className="w-full h-16 text-brand-cobalt-light" viewBox="0 0 100 30" fill="none">
                                    <path
                                        d="M0 25 C10 20, 20 28, 30 18 C40 8, 50 12, 60 5 C70 -2, 80 8, 90 2 C95 -1, 100 0, 100 0"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M0 25 C10 20, 20 28, 30 18 C40 8, 50 12, 60 5 C70 -2, 80 8, 90 2 C95 -1, 100 0, 100 0 L100 30 L0 30 Z"
                                        fill="url(#sparkline-grad)"
                                        opacity="0.1"
                                    />
                                    <defs>
                                        <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2b5cb8" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </motion.div>

                            {/* Card 2: Safe Budget (Shifted Right) */}
                            <motion.div
                                initial={{ y: 30, opacity: 0, rotate: 4 }}
                                animate={{ y: 0, opacity: 1, rotate: 6 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="absolute -right-4 top-10 w-56 bg-brand-midnight/70 backdrop-blur-lg border border-brand-cream/5 rounded-2xl p-5 shadow-2xl z-10"
                            >
                                <span className="text-[10px] text-brand-silver font-bold uppercase tracking-wider">Monthly Savings Target</span>
                                <div className="text-lg font-bold text-brand-cream mt-1 mb-3 font-mono">$4,500.00</div>
                                
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] text-brand-silver font-bold font-mono">
                                        <span>Progress</span>
                                        <span className="text-brand-cobalt-light font-bold">82%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-brand-midnight rounded-full overflow-hidden">
                                        <div className="h-full w-[82%] bg-brand-cobalt rounded-full" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 3: Recent Activity (At Bottom) */}
                            <motion.div
                                initial={{ y: 40, opacity: 0, rotate: -1 }}
                                animate={{ y: 0, opacity: 1, rotate: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                className="absolute -bottom-8 left-12 w-64 bg-brand-midnight/50 backdrop-blur-md border border-brand-cream/5 rounded-2xl p-4 shadow-2xl z-0"
                            >
                                <span className="text-[9px] text-brand-silver font-bold uppercase tracking-wider">Quick Activity</span>
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="h-8 w-8 rounded-lg bg-brand-cobalt/10 flex items-center justify-center border border-brand-cobalt/20">
                                        <span className="text-[9px] font-bold text-brand-cobalt-light font-mono">AAPL</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="text-xs font-semibold text-brand-cream">Bought Apple Stock</div>
                                        <div className="text-[10px] text-brand-silver font-mono">2 shares at $178.50</div>
                                    </div>
                                    <div className="text-xs font-bold text-brand-cream font-mono">-$357.00</div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom Testimonial Block */}
                    <div className="relative z-20 space-y-4">
                        {/* Badges */}
                        <div className="flex items-center gap-2">
                            <span className="bg-brand-cream/5 text-brand-silver text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-brand-cream/10">
                                Wealth Management
                            </span>
                            <span className="bg-brand-cream/5 text-brand-silver text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-brand-cream/10">
                                Financial Analytics
                            </span>
                        </div>

                        {/* Testimonial Quote */}
                        <div className="bg-brand-midnight/80 backdrop-blur-xl border border-brand-cream/10 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <p className="text-xs text-brand-silver leading-relaxed font-medium">
                                "Finvest has completely transformed how I manage my investments. What used to take hours of manual spreadsheet tracking is now fully automated and beautifully visualized."
                            </p>
                            <div className="mt-4 flex flex-col">
                                <span className="text-xs font-bold text-brand-cream">Sarah Jenkins</span>
                                <span className="text-[10px] text-brand-silver/60 mt-0.5 font-mono">Founder, WealthyFlow</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
