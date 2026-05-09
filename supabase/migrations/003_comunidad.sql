-- Community posts table
CREATE TABLE IF NOT EXISTS comunidad_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  contenido TEXT NOT NULL CHECK (char_length(contenido) <= 500),
  categoria TEXT NOT NULL DEFAULT 'general', -- 'general' | 'logro' | 'pregunta' | 'tip' | 'canal'
  likes INTEGER NOT NULL DEFAULT 0,
  canal_url TEXT, -- optional YouTube channel link
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table (prevent double likes)
CREATE TABLE IF NOT EXISTS comunidad_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES comunidad_posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);

-- RLS
ALTER TABLE comunidad_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read posts" ON comunidad_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert" ON comunidad_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own posts" ON comunidad_posts FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE comunidad_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read likes" ON comunidad_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON comunidad_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON comunidad_likes FOR DELETE USING (auth.uid() = user_id);
