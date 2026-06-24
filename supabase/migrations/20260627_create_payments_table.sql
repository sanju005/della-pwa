begin;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  provider_id uuid not null references auth.users(id) on delete cascade,
  service_title text not null default '',
  currency text not null default 'myr',
  amount numeric(10,2) not null default 0,
  payment_provider text not null default 'stripe',
  payment_method text null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  stripe_checkout_session_id text null,
  stripe_payment_intent_id text null,
  checkout_url text null,
  paid_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_booking_id_key unique (booking_id),
  constraint payments_checkout_session_key unique (stripe_checkout_session_id)
);

create index if not exists payments_customer_id_idx
  on public.payments (customer_id, created_at desc);

create index if not exists payments_provider_id_idx
  on public.payments (provider_id, created_at desc);

create index if not exists payments_status_idx
  on public.payments (status, created_at desc);

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

alter table public.payments enable row level security;

drop policy if exists "payments_select_participants" on public.payments;
create policy "payments_select_participants"
on public.payments
for select
to authenticated
using (
  auth.uid() = customer_id
  or auth.uid() = provider_id
);

drop policy if exists "payments_insert_service_role_only" on public.payments;
create policy "payments_insert_service_role_only"
on public.payments
for insert
to service_role
with check (true);

drop policy if exists "payments_update_service_role_only" on public.payments;
create policy "payments_update_service_role_only"
on public.payments
for update
to service_role
using (true)
with check (true);

commit;
