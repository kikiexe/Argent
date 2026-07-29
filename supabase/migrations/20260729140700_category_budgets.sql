-- Migration: Add Category Budgets table, policies, and aggregation RPC

-- Table: category_budgets
CREATE TABLE IF NOT EXISTS category_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year > 2000),
    limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount >= 0),
    UNIQUE (user_id, category_id, month, year)
);

-- Enable Row Level Security (RLS)
ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own category budgets
CREATE POLICY "Users can only access their own category budgets"
    ON category_budgets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Performance Index
CREATE INDEX IF NOT EXISTS idx_category_budgets_user_month_year ON category_budgets(user_id, month, year);

-- RPC for aggregating usage per category
CREATE OR REPLACE FUNCTION get_category_budget_usage(target_month INTEGER, target_year INTEGER)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    limit_amount NUMERIC,
    spent_amount NUMERIC
) SECURITY INVOKER AS $$
DECLARE
    start_of_month DATE;
    end_of_month DATE;
BEGIN
    start_of_month := MAKE_DATE(target_year, target_month, 1);
    end_of_month := (start_of_month + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    RETURN QUERY
    SELECT
        cb.category_id,
        c.name AS category_name,
        cb.limit_amount,
        COALESCE(SUM(t.amount), 0)::NUMERIC AS spent_amount
    FROM category_budgets cb
    JOIN categories c ON c.id = cb.category_id
    LEFT JOIN transactions t
        ON t.category_id = cb.category_id
        AND t.user_id = auth.uid()
        AND t.type = 'EXPENSE'
        AND t.date >= start_of_month
        AND t.date <= end_of_month
    WHERE cb.user_id = auth.uid()
        AND cb.month = target_month
        AND cb.year = target_year
    GROUP BY cb.category_id, c.name, cb.limit_amount;
END;
$$ LANGUAGE plpgsql;

-- RPC for lazy copy carry-over budgets
CREATE OR REPLACE FUNCTION initialize_category_budgets(target_month INTEGER, target_year INTEGER)
RETURNS VOID SECURITY INVOKER AS $$
BEGIN
    INSERT INTO category_budgets (user_id, category_id, month, year, limit_amount)
    SELECT user_id, category_id, target_month, target_year, limit_amount
    FROM category_budgets
    WHERE user_id = auth.uid()
        AND (year, month) = (
            SELECT year, month FROM category_budgets
            WHERE user_id = auth.uid() AND (year, month) < (target_year, target_month)
            ORDER BY year DESC, month DESC
            LIMIT 1
        )
    ON CONFLICT (user_id, category_id, month, year) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
