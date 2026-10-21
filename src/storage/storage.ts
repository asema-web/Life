import type { AppData, Category, Habit, Priority, Task, Transaction } from '../types';
import { todayISO } from '../utils/dates';

const KEY = 'life-planner:v1';
const cat = (id: string, name: string, color: string): Category => ({ id, name, color });

export const defaultData = (): AppData => ({
  version: 1,
  theme: 'light',
  monthlyBudget: 0,
  habits: [],
  tasks: [],
  transactions: [],
  categories: {
    habit: [cat('h1', 'Здоровье', '#8fcfa5'), cat('h2', 'Учёба', '#9cc9f0'), cat('h3', 'Личное', '#f2b5c8'), cat('h4', 'Другое', '#c9c9d6')],
    task: [
      cat('t1', 'Личное', '#f2b5c8'), cat('t2', 'Учёба', '#9cc9f0'), cat('t3', 'Работа', '#b9a8ef'),
      cat('t4', 'Здоровье', '#8fcfa5'), cat('t5', 'Финансы', '#f3d38a'), cat('t6', 'Другое', '#c9c9d6'),
    ],
    income: [cat('i1', 'Зарплата', '#8fcfa5'), cat('i2', 'Подработка', '#9cc9f0'), cat('i3', 'Подарки', '#f2b5c8'), cat('i4', 'Другое', '#c9c9d6')],
    expense: [
      cat('e1', 'Еда', '#f3d38a'), cat('e2', 'Транспорт', '#9cc9f0'), cat('e3', 'Жильё', '#b9a8ef'),
      cat('e4', 'Здоровье', '#8fcfa5'), cat('e5', 'Развлечения', '#f2b5c8'), cat('e6', 'Другое', '#c9c9d6'),
    ],
  },
});

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d);
const isISO = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const list = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter(isObj) : []);

function cats(v: unknown, fallback: Category[]): Category[] {
  const r = list(v)
    .map((x) => cat(str(x.id), str(x.name), str(x.color, '#c9c9d6')))
    .filter((c) => c.id && c.name);
  return r.length ? r : fallback;
}

/** Turns any unknown value into a valid AppData, dropping broken records. */
export function sanitize(raw: unknown): AppData {
  const def = defaultData();
  if (!isObj(raw)) return def;
  const c = isObj(raw.categories) ? raw.categories : {};

  const habits: Habit[] = list(raw.habits)
    .filter((h) => str(h.id) && str(h.name))
    .map((h) => ({
      id: str(h.id),
      name: str(h.name),
      description: str(h.description),
      categoryId: str(h.categoryId),
      color: str(h.color, '#8fcfa5'),
      days: Array.isArray(h.days)
        ? [...new Set((h.days as unknown[]).filter((n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 6))]
        : [0, 1, 2, 3, 4, 5, 6],
      createdAt: isISO(h.createdAt) ? h.createdAt : todayISO(),
      done: Array.isArray(h.done) ? [...new Set((h.done as unknown[]).filter(isISO))] : [],
    }));

  const tasks: Task[] = list(raw.tasks)
    .filter((t) => str(t.id) && str(t.title))
    .map((t) => ({
      id: str(t.id),
      title: str(t.title),
      createdAt: isISO(t.createdAt) ? t.createdAt : todayISO(),
      due: isISO(t.due) ? t.due : '',
      priority: (['high', 'medium', 'low'].includes(str(t.priority)) ? t.priority : 'medium') as Priority,
      categoryId: str(t.categoryId),
      done: t.done === true,
      doneAt: t.done === true && isISO(t.doneAt) ? t.doneAt : '',
    }));

  const transactions: Transaction[] = list(raw.transactions)
    .filter((t) => str(t.id) && (t.type === 'income' || t.type === 'expense') && Number.isFinite(Number(t.amount)) && Number(t.amount) > 0 && isISO(t.date))
    .map((t) => ({
      id: str(t.id),
      type: t.type as 'income' | 'expense',
      title: str(t.title),
      amount: Number(t.amount),
      categoryId: str(t.categoryId),
      date: t.date as string,
      note: str(t.note),
    }));

  const budget = Number(raw.monthlyBudget);
  return {
    version: 1,
    theme: raw.theme === 'dark' ? 'dark' : 'light',
    monthlyBudget: Number.isFinite(budget) && budget >= 0 ? budget : 0,
    habits,
    tasks,
    transactions,
    categories: {
      habit: cats(c.habit, def.categories.habit),
      task: cats(c.task, def.categories.task),
      income: cats(c.income, def.categories.income),
      expense: cats(c.expense, def.categories.expense),
    },
  };
}

export function loadData(): AppData {
  let s: string | null = null;
  try {
    s = localStorage.getItem(KEY);
    return s ? sanitize(JSON.parse(s)) : defaultData();
  } catch {
    // keep the unreadable original so nothing is lost silently
    try { if (s) localStorage.setItem(KEY + ':corrupt', s); } catch { /* ignore */ }
    return defaultData();
  }
}

export function saveData(d: AppData): void {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* storage full or blocked */ }
}
