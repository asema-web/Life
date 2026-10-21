import type { Priority } from '../types';

export const CURRENCY = 'сом';
export const fmtMoney = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ${CURRENCY}`;

export const PRIORITY: Record<Priority, { label: string; rank: number }> = {
  high: { label: 'Высокий', rank: 0 },
  medium: { label: 'Средний', rank: 1 },
  low: { label: 'Низкий', rank: 2 },
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
