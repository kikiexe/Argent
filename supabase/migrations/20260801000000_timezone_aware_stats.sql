/* Update get_user_stats RPC function to compute current month's expenses using user timezone */
CREATE OR REPLACE FUNCTION get_user_stats(user_timezone TEXT DEFAULT 'UTC')
RETURNS TABLE (
    lifetime_balance NUMERIC,
    current_month_expenses NUMERIC
) SECURITY INVOKER AS $$
DECLARE
    user_id_val UUID;
    start_of_month DATE;
    end_of_month DATE;
BEGIN
    user_id_val := auth.uid();
    start_of_month := DATE_TRUNC('month', CURRENT_TIMESTAMP AT TIME ZONE user_timezone)::DATE;
    end_of_month := (start_of_month + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    RETURN QUERY
    SELECT
        (COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0))::NUMERIC as lifetime_balance,
        COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' AND t.date >= start_of_month AND t.date <= end_of_month THEN t.amount ELSE 0 END), 0)::NUMERIC as current_month_expenses
    FROM transactions t
    WHERE t.user_id = user_id_val;
END;
$$ LANGUAGE plpgsql;
