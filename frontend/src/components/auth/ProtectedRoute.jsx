import { useAuth } from "../providers/auth-provider";
import { AuthForm } from "./AuthForm";
import { Landmark } from "lucide-react";
import { motion } from "framer-motion";

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (<div className="flex min-h-screen flex-col items-center justify-center bg-brand-midnight text-brand-cream">
        <motion.div animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5],
            }} transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            }} className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-cobalt/20 bg-brand-cobalt/10">
          <Landmark className="h-6 w-6 text-brand-cobalt-light"/>
        </motion.div>
        <span className="mt-4 text-[10px] font-bold tracking-[0.25em] text-brand-silver uppercase font-mono">
          Loading workspace...
        </span>
      </div>);
    }
    if (!user) {
        return <AuthForm />;
    }
    return <>{children}</>;
}
