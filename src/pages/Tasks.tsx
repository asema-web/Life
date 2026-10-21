import { useMemo, useState } from 'react';
import { Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import TaskForm from '../components/TaskForm';
import { addDays, diffDays, fmtDate } from '../utils/dates';
import { PRIORITY } from '../utils/format';
import { toggleTask } from '../utils/actions';
import type { Priority, Task } from '../types';

type Tab = 'active' | 'done';
type Period = 'all' | 'today' | 'week' | 'overdue';
type Sort = 'deadline' | 'priority';

export default function Tasks() {
  const { data, today, update } = useApp();
  const [tab, setTab] = useState<Tab>('active');
  const [q, setQ] = useState('');
  const [period, setPeriod] = useState<Period>('all');
  const [pri, setPri] = useState<'all' | Priority>('all');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<Sort>('deadline');
  const [editing, setEditing] = useState<Task | 'new' | null>(null);

  const catOf = (id: string) => data.categories.task.find((c) => c.id === id);
  const activeCount = data.tasks.filter((t) => !t.done).length;
  const doneCount = data.tasks.length - activeCount;

  const rows = useMemo(() => {
    const weekEnd = addDays(today, 6);
    const dueKey = (t: Task) => t.due || '9999-99-99';
    const list = data.tasks.filter((t) => {
      if ((tab === 'done') !== t.done) return false;
      if (q.trim() && !t.title.toLowerCase().includes(q.trim().toLowerCase())) return false;
      if (pri !== 'all' && t.priority !== pri) return false;
      if (cat !== 'all' && t.categoryId !== cat) return false;
      if (tab === 'active') {
        if (period === 'today' && t.due !== today) return false;
        if (period === 'week' && !(t.due && t.due >= today && t.due <= weekEnd)) return false;
        if (period === 'overdue' && !(t.due && t.due < today)) return false;
      }
      return true;
    });
    if (tab === 'done') return list.sort((a, b) => b.doneAt.localeCompare(a.doneAt));
    return list.sort((a, b) =>
      sort === 'priority'
        ? PRIORITY[a.priority].rank - PRIORITY[b.priority].rank || dueKey(a).localeCompare(dueKey(b))
        : dueKey(a).localeCompare(dueKey(b)) || PRIORITY[a.priority].rank - PRIORITY[b.priority].rank,
    );
  }, [data.tasks, tab, q, period, pri, cat, sort, today]);

  const remove = (t: Task) => {
    if (window.confirm(`Удалить задачу «${t.title}»?`)) update((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== t.id) }));
  };

  const daysLeft = (t: Task) => {
    if (t.done || !t.due) return '—';
    const n = diffDays(t.due, today);
    return n < 0 ? `просрочено на ${-n} дн.` : n === 0 ? 'сегодня' : `${n} дн.`;
  };
  const status = (t: Task) => (t.done ? { label: 'Выполнена', cls: 'ok' } : t.due && t.due < today ? { label: 'Просрочена', cls: 'late' } : { label: 'В работе', cls: 'wip' });

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Мои задачи</h1>
          <p className="muted">Ищите, фильтруйте и сортируйте. Просрочка считается по сегодняшней дате.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={16} />Добавить задачу</button>
      </header>

      <div className="card">
        <div className="row wrap between">
          <div className="row">
            <button className={`chip ${tab === 'active' ? 'on' : ''}`} onClick={() => setTab('active')}>Активные ({activeCount})</button>
            <button className={`chip ${tab === 'done' ? 'on' : ''}`} onClick={() => setTab('done')}>Выполненные ({doneCount})</button>
          </div>
          <label className="search">
            <Search size={16} />
            <input className="input" placeholder="Поиск по названию" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
        <div className="row wrap filters">
          {tab === 'active' && (
            <select className="input" value={period} onChange={(e) => setPeriod(e.target.value as Period)} aria-label="Срок">
              <option value="all">Любой срок</option>
              <option value="today">На сегодня</option>
              <option value="week">На неделю</option>
              <option value="overdue">Просроченные</option>
            </select>
          )}
          <select className="input" value={pri} onChange={(e) => setPri(e.target.value as 'all' | Priority)} aria-label="Приоритет">
            <option value="all">Любой приоритет</option>
            {(Object.keys(PRIORITY) as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY[p].label}</option>)}
          </select>
          <select className="input" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Категория">
            <option value="all">Все категории</option>
            {data.categories.task.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {tab === 'active' && (
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Сортировка">
              <option value="deadline">Сначала ближайший срок</option>
              <option value="priority">Сначала высокий приоритет</option>
            </select>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card empty">
          <p>
            {data.tasks.length === 0
              ? 'Задач пока нет. Добавьте первую.'
              : tab === 'done' && doneCount === 0
                ? 'Выполненных задач пока нет.'
                : 'Под эти условия ничего не подходит. Измените фильтры или поиск.'}
          </p>
        </div>
      ) : (
        <div className="card flush">
          <div className="table-wrap">
            <table className="sheet">
              <thead>
                <tr>
                  <th></th><th>Задача</th><th>Создана</th><th>Срок</th><th>До срока</th><th>Приоритет</th><th>Категория</th><th>Статус</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const c = catOf(t.categoryId);
                  const st = status(t);
                  return (
                    <tr key={t.id} className={t.done ? 'is-done' : ''}>
                      <td>
                        <input type="checkbox" className="cb" checked={t.done} onChange={() => update((d) => toggleTask(d, t.id, today))} aria-label={`Выполнено: ${t.title}`} />
                      </td>
                      <td className="title-cell">{t.title}</td>
                      <td>{fmtDate(t.createdAt)}</td>
                      <td>{fmtDate(t.due)}</td>
                      <td className={st.cls === 'late' ? 'late-text' : ''}>{daysLeft(t)}</td>
                      <td><span className={`pill pri-${t.priority}`}>{PRIORITY[t.priority].label}</span></td>
                      <td>{c ? <span className="pill" style={{ background: c.color + '55' }}>{c.name}</span> : '—'}</td>
                      <td><span className={`pill st-${st.cls}`}>{st.label}</span></td>
                      <td className="actions">
                        {t.done && (
                          <button className="icon-btn sm" onClick={() => update((d) => toggleTask(d, t.id, today))} aria-label="Восстановить" title="Вернуть в активные"><RotateCcw size={15} /></button>
                        )}
                        <button className="icon-btn sm" onClick={() => setEditing(t)} aria-label="Редактировать"><Pencil size={15} /></button>
                        <button className="icon-btn sm" onClick={() => remove(t)} aria-label="Удалить"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && <TaskForm task={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
