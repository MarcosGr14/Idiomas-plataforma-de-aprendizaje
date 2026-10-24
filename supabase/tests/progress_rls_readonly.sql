-- Run as postgres in SQL Editor after migrations, with at least one progress row.
-- Reads only; no account or learning data is created/modified. JWT subject is
-- simulated inside this transaction, not a real login or cross-device test.
begin read only;
do $$
begin
  if not exists(select 1 from public.learning_progress) then
    raise exception 'Create progress through the app before running this test';
  end if;
  if has_table_privilege('authenticated', 'public.learning_progress', 'TRUNCATE')
     or has_table_privilege('authenticated', 'public.learning_progress', 'INSERT')
     or has_table_privilege('authenticated', 'public.learning_progress', 'UPDATE')
     or has_table_privilege('authenticated', 'public.learning_progress', 'DELETE')
     or has_table_privilege('anon', 'public.learning_progress', 'SELECT')
     or has_function_privilege('anon', 'public.save_learning_progress(bigint,jsonb)', 'EXECUTE') then
    raise exception 'Excess client privileges';
  end if;
  perform set_config('request.jwt.claim.sub', (select user_id::text from public.learning_progress limit 1), true);
end $$;
set local role authenticated;
do $$ begin
  if (select count(*) from public.learning_progress) <> 1 then
    raise exception 'Owner visibility failed';
  end if;
end $$;
reset role;
do $$ begin
  perform set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
end $$;
set local role authenticated;
do $$ begin
  if exists(select 1 from public.learning_progress) then
    raise exception 'Foreign progress visible';
  end if;
end $$;
reset role;
rollback;
select 'PASS: owner sees own row; unrelated subject sees zero rows' as rls_verification;
