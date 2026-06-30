update public.bookings
set booking_status = 'pending_provider_response'
where booking_status::text = 'pending';

update public.bookings
set booking_status = 'declined_by_provider'
where booking_status::text = 'declined';
