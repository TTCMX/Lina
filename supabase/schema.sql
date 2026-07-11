-- Run this once in the Supabase project's SQL editor.

create table if not exists coupons (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  code text not null unique,
  type text not null check (type in ('percent', 'fixed')),
  value numeric not null check (value > 0),
  active boolean not null default true,
  expires_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  min_subtotal int
);

alter table coupons enable row level security;
-- No policies defined on purpose: only requests using the service_role key
-- (server-side, via the Vercel functions/RPCs) can read/write.

create table if not exists bookings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  folio text not null unique,
  service_id text not null,
  service_name text not null,
  size_id text not null,
  size_label text not null,
  qty int not null,
  qty_unit text not null default 'servicio',
  unit_price int not null,
  subtotal int not null,
  extras jsonb not null default '[]'::jsonb,
  extras_amount int not null default 0,
  workshop_pickup boolean not null default false,
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
  mp_payment_id text,
  coupon_id bigint references coupons(id),
  coupon_code text,
  discount_amount int not null default 0
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

-- Coupon redemption is done through these functions (not raw
-- inserts/updates) so a limited-use code can't be over-redeemed by two
-- concurrent requests: `for update` locks the coupon row for the duration
-- of the transaction, so the check-then-increment is atomic.

create or replace function preview_coupon(p_code text, p_subtotal numeric)
returns table(code text, type text, value numeric, discount_amount numeric)
language plpgsql
as $$
declare
  c record;
begin
  select * into c from coupons where lower(coupons.code) = lower(p_code);
  if not found then
    raise exception 'COUPON_NOT_FOUND';
  end if;
  if not c.active then
    raise exception 'COUPON_INACTIVE';
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    raise exception 'COUPON_EXPIRED';
  end if;
  if c.max_uses is not null and c.used_count >= c.max_uses then
    raise exception 'COUPON_EXHAUSTED';
  end if;
  if c.min_subtotal is not null and p_subtotal < c.min_subtotal then
    raise exception 'COUPON_MIN_NOT_MET';
  end if;

  return query select c.code, c.type, c.value,
    case when c.type = 'percent' then round(p_subtotal * (c.value / 100))
         else least(c.value, p_subtotal) end;
end;
$$;

create or replace function redeem_coupon(p_code text, p_subtotal numeric)
returns table(coupon_id bigint, code text, type text, value numeric, discount_amount numeric)
language plpgsql
as $$
declare
  c record;
begin
  select * into c from coupons where lower(coupons.code) = lower(p_code) for update;
  if not found then
    raise exception 'COUPON_NOT_FOUND';
  end if;
  if not c.active then
    raise exception 'COUPON_INACTIVE';
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    raise exception 'COUPON_EXPIRED';
  end if;
  if c.max_uses is not null and c.used_count >= c.max_uses then
    raise exception 'COUPON_EXHAUSTED';
  end if;
  if c.min_subtotal is not null and p_subtotal < c.min_subtotal then
    raise exception 'COUPON_MIN_NOT_MET';
  end if;

  update coupons set used_count = used_count + 1 where id = c.id;

  return query select c.id, c.code, c.type, c.value,
    case when c.type = 'percent' then round(p_subtotal * (c.value / 100))
         else least(c.value, p_subtotal) end;
end;
$$;

create or replace function release_coupon(p_coupon_id bigint)
returns void
language sql
as $$
  update coupons set used_count = greatest(0, used_count - 1) where id = p_coupon_id;
$$;

create table if not exists contact_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  message text
);

alter table contact_messages enable row level security;
