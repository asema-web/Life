import type { AppData } from '../types';

export const toggleHabitDay = (d: AppData, id: string, date: string): AppData => ({
  ...d,
  habits: d.habits.map((h) =>
    h.id !== id ? h : { ...h, done: h.done.includes(date) ? h.done.filter((x) => x !== date) : [...h.done, date] },
  ),
});

export const toggleTask = (d: AppData, id: string, today: string): AppData => ({
  ...d,
  tasks: d.tasks.map((t) =>
    t.id !== id ? t : t.done ? { ...t, done: false, doneAt: '' } : { ...t, done: true, doneAt: today },
  ),
});
