begin;

create table if not exists public.provider_customer_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  rating numeric(3,2) not null check (rating >= 1 and rating <= 5),
  comment text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint provider_customer_reviews_booking_id_key unique (booking_id)
);

create index if not exists provider_customer_reviews_provider_id_idx
  on public.provider_customer_reviews (provider_id, created_at desc);

create index if not exists provider_customer_reviews_customer_id_idx
  on public.provider_customer_reviews (customer_id, created_at desc);

drop trigger if exists provider_customer_reviews_set_updated_at on public.provider_customer_reviews;
create trigger provider_customer_reviews_set_updated_at
before update on public.provider_customer_reviews
for each row
execute function public.set_updated_at();

alter table public.provider_customer_reviews enable row level security;

drop policy if exists "provider_customer_reviews_select_participants" on public.provider_customer_reviews;
create policy "provider_customer_reviews_select_participants"
on public.provider_customer_reviews
for select
to authenticated
using (
  auth.uid() = provider_id
  or auth.uid() = customer_id
);

drop policy if exists "provider_customer_reviews_insert_provider_own_booking" on public.provider_customer_reviews;
create policy "provider_customer_reviews_insert_provider_own_booking"
on public.provider_customer_reviews
for insert
to authenticated
with check (
  auth.uid() = provider_id
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and b.provider_id = auth.uid()
      and b.customer_id = customer_id
      and b.booking_status in ('review_requested', 'reviewed')
  )
);

drop policy if exists "provider_customer_reviews_update_provider_only" on public.provider_customer_reviews;
create policy "provider_customer_reviews_update_provider_only"
on public.provider_customer_reviews
for update
to authenticated
using (auth.uid() = provider_id)
with check (auth.uid() = provider_id);

commit;
