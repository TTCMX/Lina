-- Run this in the Supabase SQL editor. Enforces "one service per time
-- bracket" at the database level so two customers can never end up with
-- the same date+time slot, even if they submit at the exact same moment.
--
-- If this fails with something like "could not create unique index",
-- you have existing test rows sharing a date+time. Find them with:
--
--   select booking_date, booking_time, count(*)
--   from bookings
--   group by 1, 2
--   having count(*) > 1;
--
-- then delete/adjust the duplicates and re-run this.

alter table bookings
  add constraint bookings_date_time_unique unique (booking_date, booking_time);
