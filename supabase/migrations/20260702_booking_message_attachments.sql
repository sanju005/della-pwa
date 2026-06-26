alter table public.booking_messages
  add column if not exists attachment_data_url text null,
  add column if not exists attachment_file_name text null,
  add column if not exists attachment_mime_type text null;
