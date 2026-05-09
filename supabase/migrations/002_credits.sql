-- User credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro'
  credits_remaining INTEGER NOT NULL DEFAULT 50,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_monthly_limit INTEGER NOT NULL DEFAULT 50,
  reset_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own credits" ON user_credits FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create credits on signup
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_credits();
