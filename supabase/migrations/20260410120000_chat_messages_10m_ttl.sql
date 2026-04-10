-- Ephemeral chat: remove rows older than 10 minutes.
-- Run this in the Supabase SQL Editor (or via supabase db push) on your project.
--
-- Realtime: to remove messages from open clients when the DB deletes rows, subscribe to DELETE
-- in the app and ensure this table is in the publication (Dashboard -> Database -> Publications,
-- or): alter publication supabase_realtime add table public.chat_messages;

-- 1) Purge function (SECURITY DEFINER so it works under RLS)
CREATE OR REPLACE FUNCTION public.purge_expired_chat_messages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.chat_messages
  WHERE created_at < (now() - interval '10 minutes');
  RETURN NULL;
END;
$$;

-- 2) After any insert, clean expired rows (one DELETE per statement)
DROP TRIGGER IF EXISTS chat_messages_purge_after_insert ON public.chat_messages;
CREATE TRIGGER chat_messages_purge_after_insert
  AFTER INSERT ON public.chat_messages
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.purge_expired_chat_messages();

-- 3) Optional: periodic purge when the chat is quiet (no new messages).
-- Requires pg_cron (Database -> Extensions -> pg_cron). On some plans you enable it in the dashboard first.
-- Uncomment after enabling pg_cron:
--
-- SELECT cron.unschedule(jobid)
-- FROM cron.job
-- WHERE jobname = 'purge_expired_chat_messages';
--
-- SELECT cron.schedule(
--   'purge_expired_chat_messages',
--   '* * * * *',
--   $$DELETE FROM public.chat_messages WHERE created_at < (now() - interval '10 minutes')$$
-- );
