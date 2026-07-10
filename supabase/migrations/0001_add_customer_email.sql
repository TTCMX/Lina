-- Run this in the Supabase SQL editor if your `bookings` table already
-- exists (created before customer_email was added to schema.sql).
-- Nullable on purpose: existing rows from before this change have no email.

alter table bookings add column if not exists customer_email text;
