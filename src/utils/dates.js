import { BOOKING_LEAD_HOURS } from '../config.js';

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Central Mexico (CDMX and the metro area Lina serves) has used a fixed
// UTC-6 offset with no DST since October 2022 — same assumption as ics.js.
const MX_UTC_OFFSET_HOURS = 6;

export const TIME_SLOTS = ['9:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'];

// The real instant (independent of the caller's own timezone) a slot
// starts, anchored to Mexico City local time.
export function slotStartInstant(dateKey, time) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split('-')[0].trim().split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh + MX_UTC_OFFSET_HOURS, mm, 0));
}

// Bookings need at least BOOKING_LEAD_HOURS of notice. Checked both in the
// wizard UI (to grey out slots) and server-side in api/bookings.js (so a
// tampered/stale client request can't slip a last-minute booking through).
export function isSlotBookable(dateKey, time, now = new Date()) {
  return slotStartInstant(dateKey, time).getTime() - now.getTime() >= BOOKING_LEAD_HOURS * 60 * 60 * 1000;
}

// Local calendar date, not UTC — d.toISOString() would silently roll over
// to the next day for anyone west of UTC (all of Mexico) during their own
// evening, desyncing the key from the weekday/dayNum/month shown right next
// to it and from what isSlotBookable() actually checks.
function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDateOptions(today = new Date(), count = 14) {
  const options = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    options.push({
      key: toDateKey(d),
      weekday: WEEKDAYS[d.getDay()],
      dayNum: d.getDate(),
      month: MONTHS[d.getMonth()],
    });
  }
  return options;
}
