-- Run this in the Supabase SQL editor if your `bookings` table already
-- exists (created before the extras/per-unit pricing rework).

alter table bookings
  add column if not exists qty_unit text not null default 'servicio',
  add column if not exists extras jsonb not null default '[]'::jsonb,
  add column if not exists extras_amount int not null default 0,
  add column if not exists workshop_pickup boolean not null default false;
