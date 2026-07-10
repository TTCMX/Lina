-- Run this in the Supabase SQL editor to add discount coupons.

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

alter table bookings
  add column if not exists coupon_id bigint references coupons(id);

alter table bookings
  add column if not exists coupon_code text;

alter table bookings
  add column if not exists discount_amount int not null default 0;

-- Atomic, race-condition-safe redemption. See supabase/schema.sql for
-- the full explanation of why this is a Postgres function rather than a
-- plain update from the Vercel function.

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
