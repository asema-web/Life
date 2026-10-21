const pad = (n: number) => String(n).padStart(2, '0');

export const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
/** Display order of weekdays: Monday first */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());
export const parseISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const makeISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const addDays = (s: string, n: number) => {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
/** whole days between a and b (a - b) */
export const diffDays = (a: string, b: string) =>
  Math.round((parseISO(a).getTime() - parseISO(b).getTime()) / 86400000);
export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
export const monthLabel = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
export const fmtDate = (s: string) =>
  s ? parseISO(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '—';
export const fmtLong = (s: string) =>
  parseISO(s).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
