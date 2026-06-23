begin;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  rating numeric(3,2) not null check (rating >= 1 and rating <= 5),
  tags text[] not null default '{}',
  comment text not null default '',
  recommend boolean not null default true,
  provider_reply text null,
  provider_replied_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reviews_one_per_booking_customer unique (booking_id, customer_id)
);

create index if not exists reviews_booking_id_idx
  on public.reviews (booking_id);

create index if not exists reviews_provider_id_idx
  on public.reviews (provider_id, created_at desc);

create index if not exists reviews_customer_id_idx
  on public.reviews (customer_id, created_at desc);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();

create or replace function public.sync_provider_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_provider_id uuid;
begin
  target_provider_id := coalesce(new.provider_id, old.provider_id);

  update public.provider_profiles
  set
    average_rating = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.provider_id = target_provider_id
    ), 0),
    total_reviews = (
      select count(*)
      from public.reviews r
      where r.provider_id = target_provider_id
    )
  where id = target_provider_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_sync_provider_stats on public.reviews;
create trigger reviews_sync_provider_stats
after insert or update or delete on public.reviews
for each row
execute function public.sync_provider_review_stats();

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_participants" on public.reviews;
create policy "reviews_select_participants"
on public.reviews
for select
to authenticated
using (
  auth.uid() = customer_id
  or auth.uid() = provider_id
);

drop policy if exists "reviews_insert_customer_own_booking" on public.reviews;
create policy "reviews_insert_customer_own_booking"
on public.reviews
for insert
to authenticated
with check (
  auth.uid() = customer_id
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and b.customer_id = auth.uid()
      and b.provider_id = provider_id
      and b.booking_status in ('completed', 'paid', 'review_requested', 'reviewed')
  )
);

drop policy if exists "reviews_update_customer_or_provider" on public.reviews;
create policy "reviews_update_customer_or_provider"
on public.reviews
for update
to authenticated
using (
  auth.uid() = customer_id
  or auth.uid() = provider_id
)
with check (
  (
    auth.uid() = customer_id
    and customer_id = auth.uid()
    and provider_reply is null
  )
  or (
    auth.uid() = provider_id
    and provider_id = auth.uid()
  )
);

commit;
