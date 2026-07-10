// Central Mexico (CDMX and the metro area Lina serves) has used a fixed
// UTC-6 offset with no DST since October 2022.
const MX_UTC_OFFSET_HOURS = 6;

export function parseTimeRange(time) {
  const [start, end] = time.split('-').map((s) => s.trim());
  return { start, end };
}

export function toUtcIcsDateTime(dateISO, hhmm) {
  const [y, m, d] = dateISO.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, hh + MX_UTC_OFFSET_HOURS, mm, 0));
  return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function buildIcsContent({ uid, dateISO, time, summary, description, location }) {
  const { start, end } = parseTimeRange(time);
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lina//Booking//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@linahome.pro`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${toUtcIcsDateTime(dateISO, start)}`,
    `DTEND:${toUtcIcsDateTime(dateISO, end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function buildGoogleCalendarUrl({ dateISO, time, title, details, location }) {
  const { start, end } = parseTimeRange(time);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toUtcIcsDateTime(dateISO, start)}/${toUtcIcsDateTime(dateISO, end)}`,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
