begin;

create table if not exists public.booking_message_reads (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint booking_message_reads_booking_user_key unique (booking_id, user_id)
);

create index if not exists booking_message_reads_user_idx
  on public.booking_message_reads (user_id, updated_at desc);

create index if not exists booking_message_reads_booking_idx
  on public.booking_message_reads (booking_id);

create or replace function public.set_booking_message_reads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists booking_message_reads_set_updated_at
  on public.booking_message_reads;

create trigger booking_message_reads_set_updated_at
before update on public.booking_message_reads
for each row
execute function public.set_booking_message_reads_updated_at();

alter table public.booking_message_reads enable row level security;

drop policy if exists "booking_message_reads_select_participants" on public.booking_message_reads;
create policy "booking_message_reads_select_participants"
on public.booking_message_reads
for select
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and (b.customer_id = auth.uid() or b.provider_id = auth.uid())
  )
);

drop policy if exists "booking_message_reads_insert_self" on public.booking_message_reads;
create policy "booking_message_reads_insert_self"
on public.booking_message_reads
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and (b.customer_id = auth.uid() or b.provider_id = auth.uid())
  )
);

drop policy if exists "booking_message_reads_update_self" on public.booking_message_reads;
create policy "booking_message_reads_update_self"
on public.booking_message_reads
for update
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and (b.customer_id = auth.uid() or b.provider_id = auth.uid())
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.bookings b
    where b.id = booking_id
      and (b.customer_id = auth.uid() or b.provider_id = auth.uid())
  )
);

commit;
