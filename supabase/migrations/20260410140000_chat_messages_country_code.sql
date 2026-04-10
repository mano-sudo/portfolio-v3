-- Per-message flag: ISO 3166-1 alpha-2 from the sender's client when they post.
-- Apply in Supabase SQL Editor or `supabase db push` so REST select/insert can use country_code.
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS country_code text;
