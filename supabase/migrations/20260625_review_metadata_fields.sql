begin;

alter table if exists public.reviews
  add column if not exists tags text[] not null default '{}';

alter table if exists public.reviews
  add column if not exists recommend boolean not null default true;

alter table if exists public.reviews
  add column if not exists provider_reply text null;

alter table if exists public.reviews
  add column if not exists provider_replied_at timestamptz null;

commit;
