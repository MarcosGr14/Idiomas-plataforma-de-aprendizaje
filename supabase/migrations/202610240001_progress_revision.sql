-- Apply after 202610220001_progress.sql. Writes use compare-and-swap, never blind upserts.
alter table public.learning_progress add column if not exists revision bigint not null default 1;
revoke insert, update, delete on public.learning_progress from authenticated;

create or replace function public.save_learning_progress(expected_revision bigint, new_payload jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  saved_revision bigint;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if expected_revision < 0 or expected_revision is null or new_payload is null or jsonb_typeof(new_payload) <> 'object' or octet_length(new_payload::text) > 1048576 then
    raise exception 'Invalid progress' using errcode = '22023';
  end if;
  if expected_revision = 0 then
    insert into public.learning_progress(user_id, payload, revision, updated_at)
    values(owner_id, new_payload, 1, now())
    on conflict (user_id) do nothing
    returning revision into saved_revision;
  else
    update public.learning_progress
    set payload = new_payload, revision = revision + 1, updated_at = now()
    where user_id = owner_id and revision = expected_revision
    returning revision into saved_revision;
  end if;
  return saved_revision; -- NULL means conflict; caller preserves its pending copy.
end;
$$;
revoke all on function public.save_learning_progress(bigint, jsonb) from public, anon;
grant execute on function public.save_learning_progress(bigint, jsonb) to authenticated;
