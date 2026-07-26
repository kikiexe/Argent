/* Database Schema Initialization for Personal Finance Tracker */

/* Enable UUID generator extension if not already enabled */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/* Drop existing tables if they exist */
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS monthly_budgets;
DROP TABLE IF EXISTS categories;

/* Table: categories */
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
    UNIQUE (user_id, name, type)
);

/* Table: monthly_budgets */
CREATE TABLE monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year > 2000),
    total_limit NUMERIC(12, 2) NOT NULL CHECK (total_limit >= 0),
    UNIQUE (user_id, month, year)
);

/* Table: transactions */
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    type TEXT NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

/* Enable Row Level Security (RLS) */
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

/* Policies for categories */
CREATE POLICY "Users can only access their own categories"
    ON categories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

/* Policies for monthly_budgets */
CREATE POLICY "Users can only access their own budgets"
    ON monthly_budgets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

/* Policies for transactions */
CREATE POLICY "Users can only access their own transactions"
    ON transactions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
