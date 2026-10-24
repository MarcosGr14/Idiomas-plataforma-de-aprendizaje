-- Supabase's default grants can include TRUNCATE, REFERENCES and TRIGGER.
-- RLS does not protect TRUNCATE. Clients only need SELECT; writes use the RPC.
revoke all privileges on table public.learning_progress from anon, authenticated, public;
grant select on table public.learning_progress to authenticated;
