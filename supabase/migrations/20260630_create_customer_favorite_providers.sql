create table if not exists public.customer_favorite_providers (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.provider_profiles(id) on delete cascade,
  service_key text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint customer_favorite_providers_customer_provider_key unique (customer_id, provider_id)
);

create index if not exists customer_favorite_providers_customer_idx
  on public.customer_favorite_providers (customer_id, created_at desc);

create index if not exists customer_favorite_providers_provider_idx
  on public.customer_favorite_providers (provider_id);

create or replace function public.set_customer_favorite_providers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists customer_favorite_providers_set_updated_at
  on public.customer_favorite_providers;

create trigger customer_favorite_providers_set_updated_at
before update on public.customer_favorite_providers
for each row
execute function public.set_customer_favorite_providers_updated_at();
