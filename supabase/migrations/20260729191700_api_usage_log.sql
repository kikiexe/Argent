-- Migration: Create api_usage_log table for rate limiting API features
CREATE TABLE api_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, -- e.g. 'voice_extract', 'receipt_extract'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for optimized rate limit query lookups
CREATE INDEX idx_api_usage_user_feature_time ON api_usage_log(user_id, feature, created_at);

-- Enable RLS
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own usage logs" 
ON api_usage_log FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own usage logs" 
ON api_usage_log FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);
