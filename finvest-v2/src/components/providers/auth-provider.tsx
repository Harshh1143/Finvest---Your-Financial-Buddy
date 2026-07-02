import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../../lib/db";
import type { Profile } from "../../types";

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: Profile | null; error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ user: Profile | null; error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of current user
    async function checkAuth() {
      try {
        const currentUser = await db.auth.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await db.auth.signIn(email, password);
      if (res.user) {
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      return { user: null, error: err?.message || "Unknown error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await db.auth.signUp(name, email, password);
      if (res.user) {
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      return { user: null, error: err?.message || "Unknown error occurred" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await db.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
