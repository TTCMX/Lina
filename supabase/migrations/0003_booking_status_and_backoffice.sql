-- Run this in the Supabase SQL editor. Adds status tracking so the
-- back office can cancel/complete/reschedule bookings, and makes
-- cancelling actually free up the slot (the old plain unique constraint
-- from migration 0002 blocked it forever, even after cancelling).

alter table bookings
  add column if not exists status text not null default 'confirmed';

alter table bookings
  add constraint bookings_status_check check (status in ('confirmed', 'completed', 'cancelled'));

alter table bookings
  add column if not exists updated_at timestamptz not null default now();

alter table bookings
  drop constraint if exists bookings_date_time_unique;

create unique index if not exists bookings_date_time_active_unique
  on bookings (booking_date, booking_time)
  where status <> 'cancelled';
