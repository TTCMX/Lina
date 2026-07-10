-- Run this once in the Supabase project's SQL editor.

create table if not exists bookings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  folio text not null unique,
  service_id text not null,
  service_name text not null,
  size_id text not null,
  size_label text not null,
  qty int not null,
  unit_price int not null,
  subtotal int not null,
  booking_date date not null,
  booking_date_label text not null,
  booking_time text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  street text not null,
  colonia text not null,
  ciudad text not null,
  referencias text,
  payment_type text not null,
  amount_charged int not null,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'confirmed', 'completed', 'cancelled')),
  updated_at timestamptz not null default now(),
  mp_preference_id text,
  mp_payment_id text
);

alter table bookings enable row level security;
-- No policies defined on purpose: only requests using the service_role key
-- (server-side, via the Vercel functions) can read/write. The anon/public
-- key has zero access to this table.

-- Partial unique index: only non-cancelled bookings block a slot, so
-- cancelling one frees it up for someone else.
create unique index if not exists bookings_date_time_active_unique
  on bookings (booking_date, booking_time)
  where status <> 'cancelled';

create table if not exists contact_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  message text
);

alter table contact_messages enable row level security;
