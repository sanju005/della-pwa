begin;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'booking_actor_role'
  ) then
    create type public.booking_actor_role as enum (
      'customer',
      'provider',
      'admin',
      'system'
    );
  end if;
end $$;

alter table if exists public.booking_status_history
  add column if not exists changed_by_role public.booking_actor_role not null default 'system';

commit;
