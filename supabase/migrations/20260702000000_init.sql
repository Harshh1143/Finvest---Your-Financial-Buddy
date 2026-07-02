-- FinVest Database Migration for Supabase (PostgreSQL)
-- This file configures the tables, indexes, Row Level Security (RLS) policies, and triggers.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    email text unique not null,
    is_admin boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile" 
    on public.profiles for select 
    using (auth.uid() = id);

create policy "Users can update their own profile" 
    on public.profiles for update 
    using (auth.uid() = id);

create policy "Admins can view all profiles"
    on public.profiles for select
    using (
        exists (
            select 1 from public.profiles 
            where profiles.id = auth.uid() and profiles.is_admin = true
        )
    );

-- 2. Transactions Table
create table if not exists public.transactions (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null,
    amount numeric(12, 2) not null,
    type text not null check (type in ('income', 'expense')),
    date date not null,
    category text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can manage their own transactions" 
    on public.transactions for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create index if not exists idx_transactions_user_date on public.transactions(user_id, date);
create index if not exists idx_transactions_user_category on public.transactions(user_id, category);

-- 3. Portfolio Assets Table
create table if not exists public.portfolio_assets (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    symbol text not null,
    asset_type text not null check (asset_type in ('Stocks', 'Bonds', 'Cryptocurrency', 'Real Estate', 'Gold & Precious Metals', 'Cash & Savings', 'Vehicle', 'Other')),
    current_price numeric(15, 4) not null,
    quantity numeric(15, 8) not null,
    purchase_price numeric(15, 4) not null,
    purchase_date date not null,
    total_value numeric(20, 4) not null,
    total_cost numeric(20, 4) not null,
    unrealized_pl numeric(20, 4) not null,
    unrealized_pl_percent numeric(10, 4) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.portfolio_assets enable row level security;

create policy "Users can manage their own assets" 
    on public.portfolio_assets for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create index if not exists idx_portfolio_user_type on public.portfolio_assets(user_id, asset_type);
create index if not exists idx_portfolio_user_symbol on public.portfolio_assets(user_id, symbol);

-- 4. Portfolio History Table
create table if not exists public.portfolio_history (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null,
    asset_id bigint references public.portfolio_assets on delete cascade not null,
    price numeric(15, 4) not null,
    date_recorded timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.portfolio_history enable row level security;

create policy "Users can manage their own portfolio history" 
    on public.portfolio_history for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create index if not exists idx_portfolio_history_user_asset on public.portfolio_history(user_id, asset_id, date_recorded);

-- 5. Budgets Table (General Monthly Budget)
create table if not exists public.budgets (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null unique,
    monthly_budget numeric(12, 2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.budgets enable row level security;

create policy "Users can manage their own budgets" 
    on public.budgets for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- 6. Category Budgets Table (Category-Specific Budgets)
create table if not exists public.category_budgets (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null,
    category text not null,
    monthly_budget numeric(12, 2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, category)
);

alter table public.category_budgets enable row level security;

create policy "Users can manage their own category budgets" 
    on public.category_budgets for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create index if not exists idx_category_budgets_user on public.category_budgets(user_id, category);

-- 7. Events Table
create table if not exists public.events (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    start_date date not null,
    end_date date not null,
    budget numeric(12, 2),
    exclude_from_main_budget boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.events enable row level security;

create policy "Users can manage their own events" 
    on public.events for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create index if not exists idx_events_user_dates on public.events(user_id, start_date, end_date);

-- 8. Event Transactions Table
create table if not exists public.event_transactions (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null,
    event_id bigint references public.events on delete cascade not null,
    amount numeric(12, 2) not null,
    type text not null check (type in ('income', 'expense')),
    date date not null,
    category text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.event_transactions enable row level security;

create policy "Users can manage their own event transactions" 
    on public.event_transactions for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create index if not exists idx_event_trans_event on public.event_transactions(event_id, date);
create index if not exists idx_event_trans_user_event on public.event_transactions(user_id, event_id);

-- 9. Loans Table (For tracking debt and EMIs)
create table if not exists public.loans (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    principal numeric(12, 2) not null,
    remaining numeric(12, 2) not null,
    rate numeric(5, 2) not null,
    tenure_months integer not null,
    start_date date not null,
    next_payment_date date,
    monthly_emi numeric(12, 2) not null,
    total_paid numeric(12, 2) default 0.00 not null,
    interest_paid numeric(12, 2) default 0.00 not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.loans enable row level security;

create policy "Users can manage their own loans" 
    on public.loans for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- 10. Savings Goals Table (NEW! Highly requested feature)
create table if not exists public.savings_goals (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    target_amount numeric(12, 2) not null,
    current_amount numeric(12, 2) default 0.00 not null,
    target_date date not null,
    category text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.savings_goals enable row level security;

create policy "Users can manage their own savings goals" 
    on public.savings_goals for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- 11. Profile Creation Trigger
-- Automatically create profile table rows when a user signs up via auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
