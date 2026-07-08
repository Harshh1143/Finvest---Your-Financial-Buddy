import { supabase } from "./supabase";
// Seeding Mock Data
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000000";
const MOCK_ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const SEED_PROFILES = [
    {
        id: MOCK_USER_ID,
        name: "Demo User",
        email: "user@finvest.com",
        is_admin: false,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: MOCK_ADMIN_ID,
        name: "FinVest Administrator",
        email: "admin@finvest.com",
        is_admin: true,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    }
];
const SEED_TRANSACTIONS = (userId) => [
    {
        id: 1,
        user_id: userId,
        amount: 5000.00,
        type: "income",
        date: new Date().toISOString().split("T")[0],
        category: "Salary",
        description: "Monthly Core Technology Salary",
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        user_id: userId,
        amount: 1500.00,
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        category: "Housing",
        description: "Luxury Apartment Rent Payment",
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        user_id: userId,
        amount: 125.50,
        type: "expense",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Food",
        description: "Whole Foods Organic Groceries",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 4,
        user_id: userId,
        amount: 89.90,
        type: "expense",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Utilities",
        description: "High-Speed Fiber Internet & Electricity",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 5,
        user_id: userId,
        amount: 45.00,
        type: "expense",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Travel",
        description: "Uber ride to airport",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 6,
        user_id: userId,
        amount: 320.00,
        type: "expense",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Shopping",
        description: "Ergonomic Office Desk Chair",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 7,
        user_id: userId,
        amount: 180.00,
        type: "expense",
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Food",
        description: "Vessel Sushi Bar Dinner",
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 8,
        user_id: userId,
        amount: 15.00,
        type: "expense",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Entertainment",
        description: "Spotify Premium Annual Sub",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 9,
        user_id: userId,
        amount: 50.00,
        type: "expense",
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Health",
        description: "Equinox Gym Day Pass",
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 10,
        user_id: userId,
        amount: 5000.00,
        type: "income",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Salary",
        description: "Previous Month Core Salary",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 11,
        user_id: userId,
        amount: 1500.00,
        type: "expense",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: "Housing",
        description: "Apartment Rent Payment (Previous)",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
];
const SEED_PORTFOLIO = (userId) => [
    {
        id: 1,
        user_id: userId,
        name: "Apple Inc.",
        symbol: "AAPL",
        asset_type: "Stocks",
        current_price: 214.83,
        quantity: 12,
        purchase_price: 198.40,
        purchase_date: "2024-01-16",
        total_value: 12 * 214.83,
        total_cost: 12 * 198.40,
        unrealized_pl: 12 * (214.83 - 198.40),
        unrealized_pl_percent: ((214.83 - 198.40) / 198.40) * 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        user_id: userId,
        name: "Bitcoin",
        symbol: "BTC",
        asset_type: "Cryptocurrency",
        current_price: 64250.00,
        quantity: 0.45,
        purchase_price: 43500.00,
        purchase_date: "2023-11-05",
        total_value: 0.45 * 64250.00,
        total_cost: 0.45 * 43500.00,
        unrealized_pl: 0.45 * (64250.00 - 43500.00),
        unrealized_pl_percent: ((64250.00 - 43500.00) / 43500.00) * 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        user_id: userId,
        name: "Vanguard 10-Yr US Treasury Bond",
        symbol: "BND",
        asset_type: "Bonds",
        current_price: 74.35,
        quantity: 150,
        purchase_price: 72.00,
        purchase_date: "2024-03-10",
        total_value: 150 * 74.35,
        total_cost: 150 * 72.00,
        unrealized_pl: 150 * (74.35 - 72.00),
        unrealized_pl_percent: ((74.35 - 72.00) / 72.00) * 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
const SEED_BUDGET = (userId) => ({
    id: 1,
    user_id: userId,
    monthly_budget: 4500.00,
    created_at: new Date().toISOString()
});
const SEED_CATEGORY_BUDGETS = (userId) => [
    {
        id: 1,
        user_id: userId,
        category: "Housing",
        monthly_budget: 1800.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        user_id: userId,
        category: "Food",
        monthly_budget: 600.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        user_id: userId,
        category: "Travel",
        monthly_budget: 400.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 4,
        user_id: userId,
        category: "Shopping",
        monthly_budget: 500.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 5,
        user_id: userId,
        category: "Utilities",
        monthly_budget: 300.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
const SEED_EVENTS = (userId) => [
    {
        id: 1,
        user_id: userId,
        name: "Summer Trip 2026",
        start_date: "2026-07-15",
        end_date: "2026-07-22",
        budget: 1500.00,
        exclude_from_main_budget: true,
        created_at: new Date().toISOString()
    }
];
const SEED_EVENT_TRANSACTIONS = (userId) => [
    {
        id: 1,
        user_id: userId,
        event_id: 1,
        amount: 420.00,
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        category: "Travel",
        description: "Swiss Airlines Flight Ticket",
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        user_id: userId,
        event_id: 1,
        amount: 320.00,
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        category: "Housing",
        description: "Alpine Chalet Booking Deposit",
        created_at: new Date().toISOString()
    }
];
const SEED_LOANS = (userId) => [
    {
        id: 1,
        user_id: userId,
        name: "Home Loan",
        principal: 320000,
        remaining: 248000,
        rate: 6.5,
        tenure_months: 360,
        start_date: "2020-01-15",
        next_payment_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        monthly_emi: 2022.62,
        total_paid: 72000,
        interest_paid: 24000,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        user_id: userId,
        name: "Graduate Student Loan",
        principal: 64000,
        remaining: 41200,
        rate: 5.2,
        tenure_months: 120,
        start_date: "2022-09-01",
        next_payment_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        monthly_emi: 684.50,
        total_paid: 22800,
        interest_paid: 8600,
        created_at: new Date().toISOString()
    }
];
const SEED_SAVINGS_GOALS = (userId) => [
    {
        id: 1,
        user_id: userId,
        name: "Emergency Fund",
        target_amount: 30000,
        current_amount: 22800,
        target_date: "2027-01-01",
        category: "Savings",
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        user_id: userId,
        name: "Tesla Model S Deposit",
        target_amount: 15000,
        current_amount: 6000,
        target_date: "2026-12-15",
        category: "Goal",
        created_at: new Date().toISOString()
    }
];
// LocalStorage Database Helpers
const getStorageItem = (key, defaultValue) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
};
const setStorageItem = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};
const initializeLocalStorage = () => {
    if (!localStorage.getItem("finvest_db_initialized")) {
        setStorageItem("finvest_profiles", SEED_PROFILES);
        setStorageItem("finvest_transactions", SEED_TRANSACTIONS(MOCK_USER_ID));
        setStorageItem("finvest_portfolio", SEED_PORTFOLIO(MOCK_USER_ID));
        setStorageItem("finvest_budgets", [SEED_BUDGET(MOCK_USER_ID)]);
        setStorageItem("finvest_category_budgets", SEED_CATEGORY_BUDGETS(MOCK_USER_ID));
        setStorageItem("finvest_events", SEED_EVENTS(MOCK_USER_ID));
        setStorageItem("finvest_event_transactions", SEED_EVENT_TRANSACTIONS(MOCK_USER_ID));
        setStorageItem("finvest_loans", SEED_LOANS(MOCK_USER_ID));
        setStorageItem("finvest_savings_goals", SEED_SAVINGS_GOALS(MOCK_USER_ID));
        setStorageItem("finvest_active_user", SEED_PROFILES[0]);
        localStorage.setItem("finvest_db_initialized", "true");
    }
};
// Auto initialize on load
initializeLocalStorage();
// Unified Database Client
export const db = {
    auth: {
        getCurrentUser: async () => {
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .single();
                    if (profile)
                        return profile;
                }
                return null;
            }
            return getStorageItem("finvest_active_user", null);
        },
        signIn: async (email, password) => {
            if (supabase) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error)
                    return { user: null, error: error.message };
                if (data?.user) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", data.user.id)
                        .single();
                    return { user: profile, error: null };
                }
                return { user: null, error: "No profile found" };
            }
            // LocalStorage Auth
            const profiles = getStorageItem("finvest_profiles", []);
            const matched = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
            if (matched) {
                // Any password works for offline mock login
                setStorageItem("finvest_active_user", matched);
                return { user: matched, error: null };
            }
            return { user: null, error: "Invalid credentials" };
        },
        signUp: async (name, email, password) => {
            if (supabase) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name }
                    }
                });
                if (error)
                    return { user: null, error: error.message };
                if (data?.user) {
                    const profile = {
                        id: data.user.id,
                        name,
                        email,
                        is_admin: false,
                        created_at: new Date().toISOString()
                    };
                    return { user: profile, error: null };
                }
            }
            // LocalStorage Auth
            const profiles = getStorageItem("finvest_profiles", []);
            if (profiles.some(p => p.email.toLowerCase() === email.toLowerCase())) {
                return { user: null, error: "Email already registered" };
            }
            const newId = crypto.randomUUID();
            const newProfile = {
                id: newId,
                name,
                email,
                is_admin: false,
                created_at: new Date().toISOString()
            };
            profiles.push(newProfile);
            setStorageItem("finvest_profiles", profiles);
            setStorageItem("finvest_active_user", newProfile);
            // Auto seed transaction and portfolio items for the new user
            const transactions = getStorageItem("finvest_transactions", []);
            SEED_TRANSACTIONS(newId).forEach(t => transactions.push(t));
            setStorageItem("finvest_transactions", transactions);
            const portfolio = getStorageItem("finvest_portfolio", []);
            SEED_PORTFOLIO(newId).forEach(p => portfolio.push(p));
            setStorageItem("finvest_portfolio", portfolio);
            const budgets = getStorageItem("finvest_budgets", []);
            budgets.push(SEED_BUDGET(newId));
            setStorageItem("finvest_budgets", budgets);
            const catBudgets = getStorageItem("finvest_category_budgets", []);
            SEED_CATEGORY_BUDGETS(newId).forEach(cb => catBudgets.push(cb));
            setStorageItem("finvest_category_budgets", catBudgets);
            const loans = getStorageItem("finvest_loans", []);
            SEED_LOANS(newId).forEach(l => loans.push(l));
            setStorageItem("finvest_loans", loans);
            const goals = getStorageItem("finvest_savings_goals", []);
            SEED_SAVINGS_GOALS(newId).forEach(g => goals.push(g));
            setStorageItem("finvest_savings_goals", goals);
            return { user: newProfile, error: null };
        },
        signOut: async () => {
            if (supabase) {
                await supabase.auth.signOut();
            }
            localStorage.removeItem("finvest_active_user");
        }
    },
    transactions: {
        list: async (userId) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("transactions")
                    .select("*")
                    .eq("user_id", userId)
                    .order("date", { ascending: false });
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_transactions", []);
            return list.filter(t => t.user_id === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        },
        add: async (userId, tx) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("transactions")
                    .insert([{ ...tx, user_id: userId }])
                    .select()
                    .single();
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_transactions", []);
            const newTx = {
                ...tx,
                id: list.length > 0 ? Math.max(...list.map(t => t.id)) + 1 : 1,
                user_id: userId,
                created_at: new Date().toISOString()
            };
            list.push(newTx);
            setStorageItem("finvest_transactions", list);
            return newTx;
        },
        delete: async (userId, txId) => {
            if (supabase) {
                const { error } = await supabase
                    .from("transactions")
                    .delete()
                    .eq("id", txId)
                    .eq("user_id", userId);
                if (!error)
                    return true;
            }
            const list = getStorageItem("finvest_transactions", []);
            const filtered = list.filter(t => !(t.id === txId && t.user_id === userId));
            setStorageItem("finvest_transactions", filtered);
            return true;
        }
    },
    portfolio: {
        list: async (userId) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("portfolio_assets")
                    .select("*")
                    .eq("user_id", userId);
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_portfolio", []);
            return list.filter(p => p.user_id === userId);
        },
        add: async (userId, asset) => {
            const total_value = asset.quantity * asset.current_price;
            const total_cost = asset.quantity * asset.purchase_price;
            const unrealized_pl = total_value - total_cost;
            const unrealized_pl_percent = total_cost > 0 ? (unrealized_pl / total_cost) * 100 : 0;
            const payload = {
                ...asset,
                user_id: userId,
                total_value,
                total_cost,
                unrealized_pl,
                unrealized_pl_percent,
                updated_at: new Date().toISOString()
            };
            if (supabase) {
                const { data, error } = await supabase
                    .from("portfolio_assets")
                    .insert([payload])
                    .select()
                    .single();
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_portfolio", []);
            const newAsset = {
                ...payload,
                id: list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1,
                created_at: new Date().toISOString()
            };
            list.push(newAsset);
            setStorageItem("finvest_portfolio", list);
            return newAsset;
        },
        delete: async (userId, assetId) => {
            if (supabase) {
                const { error } = await supabase
                    .from("portfolio_assets")
                    .delete()
                    .eq("id", assetId)
                    .eq("user_id", userId);
                if (!error)
                    return true;
            }
            const list = getStorageItem("finvest_portfolio", []);
            const filtered = list.filter(p => !(p.id === assetId && p.user_id === userId));
            setStorageItem("finvest_portfolio", filtered);
            return true;
        },
        updatePrice: async (userId, assetId, currentPrice) => {
            if (supabase) {
                // Fetch current asset details
                const { data: asset } = await supabase
                    .from("portfolio_assets")
                    .select("*")
                    .eq("id", assetId)
                    .eq("user_id", userId)
                    .single();
                if (asset) {
                    const total_value = asset.quantity * currentPrice;
                    const unrealized_pl = total_value - asset.total_cost;
                    const unrealized_pl_percent = asset.total_cost > 0 ? (unrealized_pl / asset.total_cost) * 100 : 0;
                    const { data, error } = await supabase
                        .from("portfolio_assets")
                        .update({
                        current_price: currentPrice,
                        total_value,
                        unrealized_pl,
                        unrealized_pl_percent,
                        updated_at: new Date().toISOString()
                    })
                        .eq("id", assetId)
                        .select()
                        .single();
                    if (!error && data)
                        return data;
                }
            }
            const list = getStorageItem("finvest_portfolio", []);
            const idx = list.findIndex(p => p.id === assetId && p.user_id === userId);
            if (idx !== -1) {
                const asset = list[idx];
                asset.current_price = currentPrice;
                asset.total_value = asset.quantity * currentPrice;
                asset.unrealized_pl = asset.total_value - asset.total_cost;
                asset.unrealized_pl_percent = asset.total_cost > 0 ? (asset.unrealized_pl / asset.total_cost) * 100 : 0;
                asset.updated_at = new Date().toISOString();
                list[idx] = asset;
                setStorageItem("finvest_portfolio", list);
                return asset;
            }
            return null;
        }
    },
    budgets: {
        get: async (userId) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("budgets")
                    .select("*")
                    .eq("user_id", userId)
                    .maybeSingle();
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_budgets", []);
            return list.find(b => b.user_id === userId) || null;
        },
        set: async (userId, monthlyBudget) => {
            if (supabase) {
                const current = await db.budgets.get(userId);
                if (current) {
                    const { data, error } = await supabase
                        .from("budgets")
                        .update({ monthly_budget: monthlyBudget })
                        .eq("id", current.id)
                        .select()
                        .single();
                    if (!error && data)
                        return data;
                }
                else {
                    const { data, error } = await supabase
                        .from("budgets")
                        .insert([{ user_id: userId, monthly_budget: monthlyBudget }])
                        .select()
                        .single();
                    if (!error && data)
                        return data;
                }
            }
            const list = getStorageItem("finvest_budgets", []);
            const idx = list.findIndex(b => b.user_id === userId);
            if (idx !== -1) {
                list[idx].monthly_budget = monthlyBudget;
                setStorageItem("finvest_budgets", list);
                return list[idx];
            }
            else {
                const newBudget = {
                    id: list.length > 0 ? Math.max(...list.map(b => b.id)) + 1 : 1,
                    user_id: userId,
                    monthly_budget: monthlyBudget,
                    created_at: new Date().toISOString()
                };
                list.push(newBudget);
                setStorageItem("finvest_budgets", list);
                return newBudget;
            }
        },
        listCategoryBudgets: async (userId) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("category_budgets")
                    .select("*")
                    .eq("user_id", userId);
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_category_budgets", []);
            return list.filter(cb => cb.user_id === userId);
        },
        setCategoryBudget: async (userId, category, monthlyBudget) => {
            if (supabase) {
                const { data: existing } = await supabase
                    .from("category_budgets")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("category", category)
                    .maybeSingle();
                if (existing) {
                    const { data, error } = await supabase
                        .from("category_budgets")
                        .update({ monthly_budget: monthlyBudget, updated_at: new Date().toISOString() })
                        .eq("id", existing.id)
                        .select()
                        .single();
                    if (!error && data)
                        return data;
                }
                else {
                    const { data, error } = await supabase
                        .from("category_budgets")
                        .insert([{ user_id: userId, category, monthly_budget: monthlyBudget }])
                        .select()
                        .single();
                    if (!error && data)
                        return data;
                }
            }
            const list = getStorageItem("finvest_category_budgets", []);
            const idx = list.findIndex(cb => cb.user_id === userId && cb.category === category);
            if (idx !== -1) {
                list[idx].monthly_budget = monthlyBudget;
                list[idx].updated_at = new Date().toISOString();
                setStorageItem("finvest_category_budgets", list);
                return list[idx];
            }
            else {
                const newCatBudget = {
                    id: list.length > 0 ? Math.max(...list.map(cb => cb.id)) + 1 : 1,
                    user_id: userId,
                    category,
                    monthly_budget: monthlyBudget,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                list.push(newCatBudget);
                setStorageItem("finvest_category_budgets", list);
                return newCatBudget;
            }
        },
        deleteCategoryBudget: async (userId, category) => {
            if (supabase) {
                const { error } = await supabase
                    .from("category_budgets")
                    .delete()
                    .eq("user_id", userId)
                    .eq("category", category);
                if (!error)
                    return true;
            }
            const list = getStorageItem("finvest_category_budgets", []);
            const filtered = list.filter(cb => !(cb.user_id === userId && cb.category === category));
            setStorageItem("finvest_category_budgets", filtered);
            return true;
        }
    },
    events: {
        list: async (userId) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("events")
                    .select("*")
                    .eq("user_id", userId);
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_events", []);
            return list.filter(e => e.user_id === userId);
        },
        add: async (userId, event) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("events")
                    .insert([{ ...event, user_id: userId }])
                    .select()
                    .single();
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_events", []);
            const newEvent = {
                ...event,
                id: list.length > 0 ? Math.max(...list.map(e => e.id)) + 1 : 1,
                user_id: userId,
                created_at: new Date().toISOString()
            };
            list.push(newEvent);
            setStorageItem("finvest_events", list);
            return newEvent;
        },
        delete: async (userId, eventId) => {
            if (supabase) {
                const { error } = await supabase
                    .from("events")
                    .delete()
                    .eq("id", eventId)
                    .eq("user_id", userId);
                if (!error)
                    return true;
            }
            const list = getStorageItem("finvest_events", []);
            const filtered = list.filter(e => !(e.id === eventId && e.user_id === userId));
            setStorageItem("finvest_events", filtered);
            return true;
        },
        listTransactions: async (userId, eventId) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("event_transactions")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("event_id", eventId)
                    .order("date", { ascending: false });
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_event_transactions", []);
            return list.filter(et => et.user_id === userId && et.event_id === eventId);
        },
        addTransaction: async (userId, eventId, tx) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("event_transactions")
                    .insert([{ ...tx, user_id: userId, event_id: eventId }])
                    .select()
                    .single();
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_event_transactions", []);
            const newTx = {
                ...tx,
                id: list.length > 0 ? Math.max(...list.map(et => et.id)) + 1 : 1,
                user_id: userId,
                event_id: eventId,
                created_at: new Date().toISOString()
            };
            list.push(newTx);
            setStorageItem("finvest_event_transactions", list);
            return newTx;
        },
        deleteTransaction: async (userId, txId) => {
            if (supabase) {
                const { error } = await supabase
                    .from("event_transactions")
                    .delete()
                    .eq("id", txId)
                    .eq("user_id", userId);
                if (!error)
                    return true;
            }
            const list = getStorageItem("finvest_event_transactions", []);
            const filtered = list.filter(et => !(et.id === txId && et.user_id === userId));
            setStorageItem("finvest_event_transactions", filtered);
            return true;
        }
    },
    loans: {
        list: async (userId) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("loans")
                    .select("*")
                    .eq("user_id", userId);
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_loans", []);
            return list.filter(l => l.user_id === userId);
        },
        add: async (userId, loan) => {
            // Calculate EMI
            const r = loan.rate / 12 / 100;
            const n = loan.tenure_months;
            const P = loan.principal;
            const monthly_emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
            const payload = {
                ...loan,
                user_id: userId,
                remaining: loan.principal,
                monthly_emi: parseFloat(monthly_emi.toFixed(2)),
                total_paid: 0.00,
                interest_paid: 0.00,
                next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
            };
            if (supabase) {
                const { data, error } = await supabase
                    .from("loans")
                    .insert([payload])
                    .select()
                    .single();
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_loans", []);
            const newLoan = {
                ...payload,
                id: list.length > 0 ? Math.max(...list.map(l => l.id)) + 1 : 1,
                created_at: new Date().toISOString()
            };
            list.push(newLoan);
            setStorageItem("finvest_loans", list);
            return newLoan;
        },
        payEMI: async (userId, loanId, extraPayment = 0) => {
            if (supabase) {
                const { data: loan } = await supabase
                    .from("loans")
                    .select("*")
                    .eq("id", loanId)
                    .eq("user_id", userId)
                    .single();
                if (loan) {
                    const r = loan.rate / 12 / 100;
                    const interestForMonth = loan.remaining * r;
                    const principalForMonth = loan.monthly_emi - interestForMonth;
                    const totalPaidThisMonth = loan.monthly_emi + extraPayment;
                    const principalPaidThisMonth = principalForMonth + extraPayment;
                    const remaining = parseFloat(Math.max(0, loan.remaining - principalPaidThisMonth).toFixed(2));
                    const total_paid = parseFloat((loan.total_paid + totalPaidThisMonth).toFixed(2));
                    const interest_paid = parseFloat((loan.interest_paid + interestForMonth).toFixed(2));
                    const nextPaymentDate = loan.next_payment_date
                        ? new Date(new Date(loan.next_payment_date).setMonth(new Date(loan.next_payment_date).getMonth() + 1))
                            .toISOString()
                            .split("T")[0]
                        : null;
                    const { data, error } = await supabase
                        .from("loans")
                        .update({
                        remaining,
                        total_paid,
                        interest_paid,
                        next_payment_date: nextPaymentDate
                    })
                        .eq("id", loanId)
                        .select()
                        .single();
                    if (!error && data)
                        return data;
                }
            }
            const list = getStorageItem("finvest_loans", []);
            const idx = list.findIndex(l => l.id === loanId && l.user_id === userId);
            if (idx !== -1) {
                const loan = list[idx];
                const r = loan.rate / 12 / 100;
                const interestForMonth = loan.remaining * r;
                const principalForMonth = loan.monthly_emi - interestForMonth;
                const totalPaidThisMonth = loan.monthly_emi + extraPayment;
                const principalPaidThisMonth = principalForMonth + extraPayment;
                loan.remaining = parseFloat(Math.max(0, loan.remaining - principalPaidThisMonth).toFixed(2));
                loan.total_paid = parseFloat((loan.total_paid + totalPaidThisMonth).toFixed(2));
                loan.interest_paid = parseFloat((loan.interest_paid + interestForMonth).toFixed(2));
                if (loan.next_payment_date) {
                    const d = new Date(loan.next_payment_date);
                    d.setMonth(d.getMonth() + 1);
                    loan.next_payment_date = d.toISOString().split("T")[0];
                }
                list[idx] = loan;
                setStorageItem("finvest_loans", list);
                return loan;
            }
            return null;
        },
        delete: async (userId, loanId) => {
            if (supabase) {
                const { error } = await supabase
                    .from("loans")
                    .delete()
                    .eq("id", loanId)
                    .eq("user_id", userId);
                if (!error)
                    return true;
            }
            const list = getStorageItem("finvest_loans", []);
            const filtered = list.filter(l => !(l.id === loanId && l.user_id === userId));
            setStorageItem("finvest_loans", filtered);
            return true;
        }
    },
    savings: {
        list: async (userId) => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("savings_goals")
                    .select("*")
                    .eq("user_id", userId);
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_savings_goals", []);
            return list.filter(g => g.user_id === userId);
        },
        add: async (userId, goal) => {
            const payload = {
                ...goal,
                user_id: userId,
                current_amount: 0.00
            };
            if (supabase) {
                const { data, error } = await supabase
                    .from("savings_goals")
                    .insert([payload])
                    .select()
                    .single();
                if (!error && data)
                    return data;
            }
            const list = getStorageItem("finvest_savings_goals", []);
            const newGoal = {
                ...payload,
                id: list.length > 0 ? Math.max(...list.map(g => g.id)) + 1 : 1,
                created_at: new Date().toISOString()
            };
            list.push(newGoal);
            setStorageItem("finvest_savings_goals", list);
            return newGoal;
        },
        addSavings: async (userId, goalId, amount) => {
            if (supabase) {
                const { data: goal } = await supabase
                    .from("savings_goals")
                    .select("*")
                    .eq("id", goalId)
                    .eq("user_id", userId)
                    .single();
                if (goal) {
                    const current_amount = parseFloat((goal.current_amount + amount).toFixed(2));
                    const { data, error } = await supabase
                        .from("savings_goals")
                        .update({ current_amount })
                        .eq("id", goalId)
                        .select()
                        .single();
                    if (!error && data)
                        return data;
                }
            }
            const list = getStorageItem("finvest_savings_goals", []);
            const idx = list.findIndex(g => g.id === goalId && g.user_id === userId);
            if (idx !== -1) {
                list[idx].current_amount = parseFloat((list[idx].current_amount + amount).toFixed(2));
                setStorageItem("finvest_savings_goals", list);
                return list[idx];
            }
            return null;
        },
        delete: async (userId, goalId) => {
            if (supabase) {
                const { error } = await supabase
                    .from("savings_goals")
                    .delete()
                    .eq("id", goalId)
                    .eq("user_id", userId);
                if (!error)
                    return true;
            }
            const list = getStorageItem("finvest_savings_goals", []);
            const filtered = list.filter(g => !(g.id === goalId && g.user_id === userId));
            setStorageItem("finvest_savings_goals", filtered);
            return true;
        }
    },
    admin: {
        getStats: async () => {
            if (supabase) {
                const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
                const { data: txData } = await supabase.from("transactions").select("amount");
                const { count: assetCount } = await supabase.from("portfolio_assets").select("*", { count: "exact", head: true });
                const total_users = userCount || 0;
                const total_transactions = txData?.length || 0;
                const total_volume = txData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
                const total_assets = assetCount || 0;
                return { total_users, total_transactions, total_volume, total_assets };
            }
            const users = getStorageItem("finvest_profiles", []);
            const transactions = getStorageItem("finvest_transactions", []);
            const portfolio = getStorageItem("finvest_portfolio", []);
            return {
                total_users: users.length,
                total_transactions: transactions.length,
                total_volume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
                total_assets: portfolio.length
            };
        },
        getUsers: async () => {
            if (supabase) {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .order("created_at", { ascending: false });
                if (!error && data)
                    return data;
            }
            return getStorageItem("finvest_profiles", []);
        },
        promote: async (email) => {
            if (supabase) {
                const { error } = await supabase
                    .from("profiles")
                    .update({ is_admin: true })
                    .eq("email", email);
                if (!error)
                    return true;
            }
            const profiles = getStorageItem("finvest_profiles", []);
            const idx = profiles.findIndex(p => p.email.toLowerCase() === email.toLowerCase());
            if (idx !== -1) {
                profiles[idx].is_admin = true;
                setStorageItem("finvest_profiles", profiles);
                return true;
            }
            return false;
        }
    }
};
