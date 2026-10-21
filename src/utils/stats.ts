import type { Habit } from '../types';
import { addDays, daysInMonth, makeISO, parseISO } from './dates';

export const isScheduled = (h: Habit, date: string) => h.days.includes(parseISO(date).getDay());

/** Only past/current scheduled days since creation count; future days are never "missed". */
export function monthHabitStats(h: Habit, y: number, m: number, today: string) {
  const done = new Set(h.done);
  let scheduled = 0;
  let completed = 0;
  for (let d = 1; d <= daysInMonth(y, m); d++) {
    const iso = makeISO(y, m, d);
    if (iso > today) break;
    if (iso < h.createdAt || !isScheduled(h, iso)) continue;
    scheduled++;
    if (done.has(iso)) completed++;
  }
  const percent = scheduled ? Math.round((completed / scheduled) * 100) : 0;
  return { scheduled, completed, missed: scheduled - completed, percent };
}

/** Current streak of consecutive scheduled days completed. An unfinished today doesn't break it. */
export function currentStreak(h: Habit, today: string) {
  const done = new Set(h.done);
  let streak = 0;
  let d = today;
  for (let i = 0; i < 730 && d >= h.createdAt; i++) {
    if (isScheduled(h, d)) {
      if (done.has(d)) streak++;
      else if (d !== today) break;
    }
    d = addDays(d, -1);
  }
  return streak;
}
