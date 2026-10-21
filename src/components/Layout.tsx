import type { ReactNode } from 'react';
import { Flame, LayoutDashboard, ListChecks, Moon, Sun } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import type { PageId } from '../types';

const NAV: { id: PageId; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Главная', icon: <LayoutDashboard size={18} /> },
  { id: 'habits', label: 'Привычки', icon: <Flame size={18} /> },
  { id: 'tasks', label: 'Задачи', icon: <ListChecks size={18} /> },
];

export default function Layout({ page, go, children }: { page: PageId; go: (p: PageId) => void; children: ReactNode }) {
  const { data, update } = useApp();
  const dark = data.theme === 'dark';
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Life Planner</div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => go(n.id)}>
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <button className="nav-item theme" onClick={() => update((d) => ({ ...d, theme: dark ? 'light' : 'dark' }))}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{dark ? 'Светлая тема' : 'Тёмная тема'}</span>
        </button>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
