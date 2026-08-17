import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../../lib/db";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
        };
        window.addEventListener("auth-unauthorized", handleUnauthorized);
        return () => window.removeEventListener("auth-unauthorized", handleUnauthorized);
    }, []);

    useEffect(() => {
        // Initial fetch of current user
        async function checkAuth() {
            try {
                const currentUser = await db.auth.getCurrentUser();
                setUser(currentUser);
            }
            catch (err) {
                console.error("Auth check failed:", err);
            }
            finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, []);
    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const res = await db.auth.signIn(email, password);
            if (res.user) {
                setUser(res.user);
            }
            return res;
        }
        catch (err) {
            return { user: null, error: err?.message || "Unknown error occurred" };
        }
        finally {
            setLoading(false);
        }
    };
    const signUp = async (name, email, password) => {
        setLoading(true);
        try {
            const res = await db.auth.signUp(name, email, password);
            if (res.user) {
                setUser(res.user);
            }
            return res;
        }
        catch (err) {
            return { user: null, error: err?.message || "Unknown error occurred" };
        }
        finally {
            setLoading(false);
        }
    };
    const signOut = async () => {
        setLoading(true);
        try {
            await db.auth.signOut();
            setUser(null);
        }
        catch (err) {
            console.error("Sign out failed:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const updateProfile = async (profileData) => {
        try {
            const res = await db.auth.updateProfile(profileData);
            if (res.user) {
                setUser(res.user);
            }
            return res;
        }
        catch (err) {
            return { user: null, error: err?.message || "Failed to update profile" };
        }
    };
    return (<AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
