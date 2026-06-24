begin;

alter table public.payments
  alter column payment_provider set default 'cash';

alter table public.payments
  add column if not exists payment_option text not null default 'cash',
  add column if not exists company_commission_rate numeric(6,4) not null default 0.15,
  add column if not exists company_commission_amount numeric(10,2) not null default 0,
  add column if not exists provider_net_amount numeric(10,2) not null default 0,
  add column if not exists company_payment_status text not null default 'pending',
  add column if not exists company_paid_at timestamptz null,
  add column if not exists customer_confirmed_at timestamptz null,
  add column if not exists provider_sent_amount_at timestamptz null;

commit;
