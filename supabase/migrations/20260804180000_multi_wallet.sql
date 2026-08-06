/* Migration: Fitur Multi-Wallet */

/* 1. Pembuatan Tabel wallets */
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('CASH', 'BANK', 'E_WALLET', 'CREDIT')),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);

/* 2. Aktifkan Row Level Security (RLS) */
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

/* 3. Buat RLS Policy untuk wallets */
CREATE POLICY "Users can only access their own wallets"
    ON wallets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

/* 4. Pembuatan Index Performa */
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

/* 5. Modifikasi tabel transactions dengan kolom wallet_id */
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL;

/* 6. Buat Index pada tabel transactions untuk relasi wallet */
CREATE INDEX IF NOT EXISTS idx_transactions_user_wallet ON transactions(user_id, wallet_id);

/* 7. Migrasi data lama (Backfill) */
/* Buat satu wallet default ('Dompet Utama') untuk setiap user yang sudah pernah mencatat transaksi */
INSERT INTO wallets (user_id, name, type, is_default)
SELECT DISTINCT user_id, 'Dompet Utama', 'CASH', true
FROM transactions
WHERE user_id NOT IN (SELECT user_id FROM wallets)
ON CONFLICT (user_id, name) DO NOTHING;

/* 8. Trigger untuk otomatisasi pendaftaran pengguna baru */
CREATE OR REPLACE FUNCTION create_default_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, name, type, is_default)
    VALUES (NEW.id, 'Dompet Utama', 'CASH', true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_wallet
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_wallet_for_new_user();

/* 9. RPC get_wallet_balances untuk menghitung saldo tiap dompet */
CREATE OR REPLACE FUNCTION get_wallet_balances()
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    is_default BOOLEAN,
    balance NUMERIC
) SECURITY INVOKER AS $$
BEGIN
    RETURN QUERY
    SELECT
        w.id,
        w.name,
        w.type,
        w.is_default,
        COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE -t.amount END), 0)::NUMERIC AS balance
    FROM wallets w
    LEFT JOIN transactions t ON t.wallet_id = w.id AND t.user_id = auth.uid()
    WHERE w.user_id = auth.uid()
    GROUP BY w.id, w.name, w.type, w.is_default;
END;
$$ LANGUAGE plpgsql;
