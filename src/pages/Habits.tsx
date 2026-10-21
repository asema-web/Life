import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Flame, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import HabitForm from '../components/HabitForm';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import { daysInMonth, fmtLong, makeISO, monthLabel, parseISO, WEEKDAYS } from '../utils/dates';
import { currentStreak, isScheduled, monthHabitStats } from '../utils/stats';
import { toggleHabitDay } from '../utils/actions';
import type { Habit } from '../types';

export default function Habits() {
  const { data, today, update } = useApp();
  const now = parseISO(today);
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [catFilter, setCatFilter] = useState('all');
  const [editing, setEditing] = useState<Habit | 'new' | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  const shift = (n: number) => {
    const d = new Date(ym.y, ym.m + n, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };

  const habits = data.habits.filter((h) => catFilter === 'all' || h.categoryId === catFilter);
  const days = Array.from({ length: daysInMonth(ym.y, ym.m) }, (_, i) => i + 1);

  const rows = useMemo(
    () => habits.map((h) => ({ h, st: monthHabitStats(h, ym.y, ym.m, today), streak: currentStreak(h, today) })),
    [habits, ym, today],
  );
  const totalScheduled = rows.reduce((s, r) => s + r.st.scheduled, 0);
  const totalDone = rows.reduce((s, r) => s + r.st.completed, 0);
  const totalPct = totalScheduled ? Math.round((totalDone / totalScheduled) * 100) : 0;
  const history = data.habits.find((h) => h.id === historyId);

  const remove = (h: Habit) => {
    if (window.confirm(`Удалить привычку «${h.name}» вместе с историей?`)) {
      update((d) => ({ ...d, habits: d.habits.filter((x) => x.id !== h.id) }));
    }
  };

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Привычки</h1>
          <p className="muted">Отмечайте выполненные дни, статистика пересчитывается сразу.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={16} />Добавить привычку</button>
      </header>

      <div className="card">
        <div className="row between wrap">
          <div className="row">
            <button className="icon-btn" onClick={() => shift(-1)} aria-label="Предыдущий месяц"><ChevronLeft size={18} /></button>
            <strong className="cap month">{monthLabel(ym.y, ym.m)}</strong>
            <button className="icon-btn" onClick={() => shift(1)} aria-label="Следующий месяц"><ChevronRight size={18} /></button>
          </div>
          <div className="row wrap">
            <button className={`chip ${catFilter === 'all' ? 'on' : ''}`} onClick={() => setCatFilter('all')}>Все</button>
            {data.categories.habit.map((c) => (
              <button key={c.id} className={`chip ${catFilter === c.id ? 'on' : ''}`} onClick={() => setCatFilter(c.id)}>
                <i className="dot" style={{ background: c.color }} />{c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="overall">
          <span>Общее выполнение за месяц: <strong>{totalPct}%</strong> <span className="muted small">({totalDone} из {totalScheduled} запланированных дней)</span></span>
          <ProgressBar value={totalPct} />
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="card empty">
          <p>{data.habits.length === 0 ? 'Привычек пока нет. Добавьте первую, и здесь появится таблица на месяц.' : 'В этой категории привычек нет.'}</p>
          {data.habits.length === 0 && <button className="btn btn-primary" onClick={() => setEditing('new')}>Добавить привычку</button>}
        </div>
      ) : (
        <div className="card flush">
          <div className="table-wrap">
            <table className="sheet habit-table">
              <thead>
                <tr>
                  <th className="sticky">Привычка</th>
                  {days.map((d) => {
                    const iso = makeISO(ym.y, ym.m, d);
                    return (
                      <th key={d} className={iso === today ? 'today' : ''}>
                        <small>{WEEKDAYS[parseISO(iso).getDay()]}</small>
                        {d}
                      </th>
                    );
                  })}
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ h, st, streak }) => (
                  <tr key={h.id}>
                    <td className="sticky name-cell">
                      <button className="link" onClick={() => setHistoryId(h.id)} title="История выполнения">
                        <i className="dot" style={{ background: h.color }} />{h.name}
                      </button>
                      <div className="row small muted">
                        <span title="Текущая серия"><Flame size={13} /> {streak}</span>
                        <button className="icon-btn sm" onClick={() => setEditing(h)} aria-label="Редактировать"><Pencil size={14} /></button>
                        <button className="icon-btn sm" onClick={() => remove(h)} aria-label="Удалить"><Trash2 size={14} /></button>
                      </div>
                    </td>
                    {days.map((d) => {
                      const iso = makeISO(ym.y, ym.m, d);
                      if (!isScheduled(h, iso)) return <td key={d} className="off"><span className="dash">·</span></td>;
                      const on = h.done.includes(iso);
                      const locked = iso > today || iso < h.createdAt;
                      return (
                        <td key={d}>
                          <button
                            className={`check ${on ? 'on' : ''}`}
                            style={on ? { background: h.color, borderColor: h.color } : undefined}
                            disabled={locked}
                            onClick={() => update((dd) => toggleHabitDay(dd, h.id, iso))}
                            aria-label={`${h.name}, ${d}`}
                          >
                            {on && <Check size={14} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="pct" title={`выполнено ${st.completed}, пропущено ${st.missed}`}>{st.scheduled ? `${st.percent}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && <HabitForm habit={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {history && (
        <Modal title={`История: ${history.name}`} onClose={() => setHistoryId(null)}>
          <p className="muted small">Серия: {currentStreak(history, today)} · всего отметок: {history.done.length}</p>
          {history.done.length === 0 ? (
            <p className="empty">Отметок пока нет.</p>
          ) : (
            <ul className="list scroll">
              {[...history.done].sort().reverse().map((d) => <li key={d} className="cap">{fmtLong(d)}</li>)}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}
