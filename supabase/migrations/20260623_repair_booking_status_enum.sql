-- Repair older Supabase projects where booking_status was created
-- without the newer workflow values used by the live booking trigger.

do $$
begin
  if exists (
    select 1
    from pg_type
    where typname = 'booking_status'
      and typnamespace = 'public'::regnamespace
  ) then
    alter type public.booking_status add value if not exists 'pending';
    alter type public.booking_status add value if not exists 'accepted';
    alter type public.booking_status add value if not exists 'on_the_way';
    alter type public.booking_status add value if not exists 'arrived';
    alter type public.booking_status add value if not exists 'completed';
    alter type public.booking_status add value if not exists 'paid';
    alter type public.booking_status add value if not exists 'review_requested';
    alter type public.booking_status add value if not exists 'reviewed';
    alter type public.booking_status add value if not exists 'declined';
    alter type public.booking_status add value if not exists 'cancelled';
  end if;
end
$$;
