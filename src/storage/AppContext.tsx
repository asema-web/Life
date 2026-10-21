import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppData } from '../types';
import { todayISO } from '../utils/dates';
import { loadData, saveData } from './storage';

export interface AppCtx {
  data: AppData;
  today: string;
  update: (fn: (d: AppData) => AppData) => void;
}

export const AppContext = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [today, setToday] = useState(todayISO);

  useEffect(() => saveData(data), [data]);
  useEffect(() => { document.documentElement.dataset.theme = data.theme; }, [data.theme]);
  useEffect(() => {
    const t = setInterval(() => setToday(todayISO()), 30000);
    return () => clearInterval(t);
  }, []);

  const value = useMemo<AppCtx>(() => ({ data, today, update: (fn) => setData(fn) }), [data, today]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
