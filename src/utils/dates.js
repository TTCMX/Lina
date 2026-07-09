const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const TIME_SLOTS = ['9:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'];

export function getDateOptions(today = new Date(), count = 14) {
  const options = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    options.push({
      key,
      weekday: WEEKDAYS[d.getDay()],
      dayNum: d.getDate(),
      month: MONTHS[d.getMonth()],
    });
  }
  return options;
}
