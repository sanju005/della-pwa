create unique index if not exists payments_booking_id_unique_idx
  on public.payments (booking_id)
  where booking_id is not null;
