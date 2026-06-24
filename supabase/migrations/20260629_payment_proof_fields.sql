begin;

alter table public.payments
  add column if not exists customer_payment_proof_data_url text null,
  add column if not exists customer_payment_proof_file_name text null,
  add column if not exists customer_payment_proof_mime_type text null,
  add column if not exists provider_company_payment_proof_data_url text null,
  add column if not exists provider_company_payment_proof_file_name text null,
  add column if not exists provider_company_payment_proof_mime_type text null;

commit;
