begin;

create or replace function public.log_booking_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_status_history (
      booking_id,
      old_status,
      new_status,
      changed_by,
      changed_by_role,
      note
    ) values (
      new.id,
      null,
      new.booking_status,
      new.customer_id,
      'customer'::public.booking_actor_role,
      'Booking request created'
    );

    return new;
  end if;

  if new.booking_status is distinct from old.booking_status then
    insert into public.booking_status_history (
      booking_id,
      old_status,
      new_status,
      changed_by,
      changed_by_role,
      note
    ) values (
      new.id,
      old.booking_status,
      new.booking_status,
      auth.uid(),
      case
        when auth.uid() = new.customer_id then 'customer'::public.booking_actor_role
        when auth.uid() = new.provider_id then 'provider'::public.booking_actor_role
        else 'admin'::public.booking_actor_role
      end,
      case
        when new.booking_status = 'accepted' then coalesce(nullif(new.provider_response_note, ''), 'Provider accepted booking')
        when new.booking_status = 'declined' then coalesce(nullif(new.decline_reason, ''), 'Provider declined booking')
        else ''
      end
    );
  end if;

  return new;
end;
$$;

commit;
