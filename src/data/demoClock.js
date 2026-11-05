// L'orologio della demo (Struttura 2.0, Famiglia e tablet di ROSS): la demo parte sempre dal giorno reale di oggi.
// I momenti si salvano come scostamenti in giorni da oggi, mai come etichette: le etichette si calcolano qui.
// La Struttura attuale resta sul suo giorno fisso (DEMO_TODAY in demoData.js) e non usa questo orologio.

const startOfDay = (date) => { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; };

// Oggi, a mezzanotte (ora locale).
export const demoToday = () => startOfDay(new Date());

// Una data «N giorni fa, alle hh:mm». Con giorni negativi è nel futuro (per esempio -2 = dopodomani).
export function at(daysAgo = 0, time = "12:00") {
  const [h, m] = time.split(":").map(Number);
  const d = demoToday();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

// Quanti giorni fa rispetto a oggi (0 = oggi, 1 = ieri; negativo nel futuro).
export const daysAgo = (date) => Math.round((demoToday() - startOfDay(date)) / 86400000);

const fmt = (options) => new Intl.DateTimeFormat("it-IT", options);
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const longDay = fmt({ weekday: "long", day: "numeric", month: "long" });
const shortDay = fmt({ weekday: "short", day: "numeric" });
const dayMonth = fmt({ day: "numeric", month: "long" });
const monthYear = fmt({ month: "long", year: "numeric" });
const weekdayOnly = fmt({ weekday: "long" });
const clock = fmt({ hour: "2-digit", minute: "2-digit" });

// «lunedì 21 settembre», «Lunedì 21 settembre», «lun 21», «21 settembre», «settembre 2026», «lunedì».
export const dayText = (daysBack = 0, { capital = false } = {}) => { const t = longDay.format(at(daysBack)); return capital ? capitalize(t) : t; };
export const dayShort = (daysBack = 0) => capitalize(shortDay.format(at(daysBack)).replace(".", ""));
export const dateText = (daysBack = 0) => dayMonth.format(at(daysBack));
export const monthText = (daysBack = 0, { capital = true } = {}) => { const t = monthYear.format(at(daysBack)); return capital ? capitalize(t) : t; };
export const weekdayText = (daysBack = 0, { capital = false } = {}) => { const t = weekdayOnly.format(at(daysBack)); return capital ? capitalize(t) : t; };
export const timeText = (date) => clock.format(new Date(date));

// «15–21 settembre» (o «28 settembre – 4 ottobre»): da `from` giorni fa a `to` giorni fa.
export function rangeText(from, to) {
  const a = at(from), b = at(to);
  return a.getMonth() === b.getMonth() ? `${a.getDate()}–${dayMonth.format(b)}` : `${dayMonth.format(a)} – ${dayMonth.format(b)}`;
}

// Quanti giorni mancano al prossimo giorno della settimana nominato («martedì» → 1 se oggi è lunedì; 0 se è oggi).
const weekdays = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
export function daysUntil(weekday) {
  const w = weekdays.indexOf(weekday.toLowerCase());
  return w < 0 ? null : (w - demoToday().getDay() + 7) % 7;
}

// L'etichetta di un giorno nelle linee del tempo: Oggi, Ieri, il giorno della settimana fino a 6 giorni,
// poi «La settimana scorsa» e «N settimane fa», sempre con la data. Restituisce [etichetta, data].
export function dayLabel(date) {
  const n = daysAgo(date);
  const full = longDay.format(new Date(date));
  if (n <= 0) return ["Oggi", full];
  if (n === 1) return ["Ieri", full];
  if (n < 7) return [capitalize(full), ""];
  if (n < 14) return ["La settimana scorsa", full];
  return [`${Math.floor(n / 7)} settimane fa`, full];
}

// L'etichetta breve di un momento: «Oggi, 11:20», «Ieri, 17:40», «Venerdì, 15:30», «18 settembre».
export function whenText(date) {
  const n = daysAgo(date);
  const t = timeText(date);
  if (n <= 0) return `Oggi, ${t}`;
  if (n === 1) return `Ieri, ${t}`;
  if (n < 7) return `${capitalize(weekdayOnly.format(new Date(date)))}, ${t}`;
  return dayMonth.format(new Date(date));
}
