import { useAuth } from "../providers/auth-provider";
import { AuthForm } from "./AuthForm";
import { Landmark } from "lucide-react";
import { motion } from "framer-motion";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#020617] text-slate-100">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-cyan-400/30 bg-cyan-500/10 shadow-[0_12px_40px_rgba(34,211,238,0.18)]"
        >
          <Landmark className="h-8 w-8 text-cyan-300" />
        </motion.div>
        <span className="mt-4 text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">
          Loading workspace...
        </span>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <>{children}</>;
}
