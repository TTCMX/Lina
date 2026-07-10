-- Run this in the Supabase SQL editor before deploying real payments.

alter table bookings
  add column if not exists mp_preference_id text;

alter table bookings
  add column if not exists mp_payment_id text;

alter table bookings
  drop constraint if exists bookings_status_check;

alter table bookings
  add constraint bookings_status_check check (status in ('pending_payment', 'confirmed', 'completed', 'cancelled'));

alter table bookings
  alter column status set default 'pending_payment';

-- The existing partial unique index (from migration 0003) already covers
-- pending_payment correctly: it excludes only 'cancelled' rows, so a
-- pending-payment booking still holds its slot, exactly like a confirmed
-- one. No change needed there.
