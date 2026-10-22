-- Run once in the Supabase SQL editor. No service-role key belongs in the frontend.
create table if not exists public.learning_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.learning_progress enable row level security;
revoke all on public.learning_progress from anon;
grant select, insert, update, delete on public.learning_progress to authenticated;
create policy "Read own progress" on public.learning_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own progress" on public.learning_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own progress" on public.learning_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own progress" on public.learning_progress for delete to authenticated using ((select auth.uid()) = user_id);
-- XP is personal motivation, never a trusted leaderboard/payment/credential value.
