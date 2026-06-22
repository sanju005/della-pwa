alter table public.provider_services
  add column if not exists image_data_urls text[] not null default '{}'::text[];

alter table public.provider_services
  add column if not exists image_captions text[] not null default '{}'::text[];

alter table public.provider_services
  add column if not exists certificate_data_urls text[] not null default '{}'::text[];

alter table public.provider_services
  add column if not exists certificate_captions text[] not null default '{}'::text[];
