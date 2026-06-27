begin;

do $$
begin
  alter type public.booking_status add value if not exists 'pending_provider_response';
  alter type public.booking_status add value if not exists 'declined_by_provider';
  alter type public.booking_status add value if not exists 'work_finished_by_provider';
  alter type public.booking_status add value if not exists 'work_confirmed_by_user';
  alter type public.booking_status add value if not exists 'final_payment_sent';
  alter type public.booking_status add value if not exists 'cash_paid_by_user';
  alter type public.booking_status add value if not exists 'payment_received_by_provider';
  alter type public.booking_status add value if not exists 'completed';
end $$;

do $$
begin
  alter type public.notification_type add value if not exists 'provider_work_finished';
  alter type public.notification_type add value if not exists 'user_work_confirmed';
  alter type public.notification_type add value if not exists 'final_payment_sent';
  alter type public.notification_type add value if not exists 'cash_paid_by_user';
  alter type public.notification_type add value if not exists 'payment_received_by_provider';
  alter type public.notification_type add value if not exists 'task_completed';
end $$;

alter table public.bookings
  add column if not exists work_finished_at timestamptz null,
  add column if not exists work_finished_images jsonb not null default '[]'::jsonb,
  add column if not exists work_confirmed_by_user_at timestamptz null,
  add column if not exists payment_sent_at timestamptz null,
  add column if not exists payment_breakdown jsonb not null default '[]'::jsonb,
  add column if not exists booking_price numeric(10,2) not null default 0,
  add column if not exists additional_charges jsonb not null default '[]'::jsonb,
  add column if not exists discount_amount numeric(10,2) not null default 0,
  add column if not exists final_amount numeric(10,2) not null default 0,
  add column if not exists cash_paid_by_user_at timestamptz null,
  add column if not exists cash_payment_proof_images jsonb not null default '[]'::jsonb,
  add column if not exists payment_received_by_provider_at timestamptz null,
  add column if not exists user_review_status text not null default 'pending',
  add column if not exists provider_review_status text not null default 'pending';

update public.bookings
set booking_status = 'pending_provider_response'
where booking_status = 'pending';

update public.bookings
set booking_status = 'declined_by_provider'
where booking_status = 'declined';

update public.bookings
set booking_price = coalesce(nullif(booking_price, 0), quoted_amount, 0),
    final_amount = coalesce(nullif(final_amount, 0), quoted_amount, 0)
where booking_price = 0 or final_amount = 0;

alter table public.reviews
  add column if not exists photos text[] not null default '{}';

alter table public.provider_customer_reviews
  add column if not exists photos text[] not null default '{}';

commit;
