import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownCircle, ArrowUpCircle, Check, Plus } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import TaskForm from '../components/TaskForm';
import HabitForm from '../components/HabitForm';
import TxForm from '../components/TxForm';
import { addDays, diffDays, fmtDate, fmtLong, parseISO, WEEKDAYS } from '../utils/dates';
import { fmtMoney } from '../utils/format';
import { isScheduled } from '../utils/stats';
import { toggleHabitDay } from '../utils/actions';
import type { PageId } from '../types';

type Modal = 'task' | 'habit' | 'income' | 'expense' | null;

export default function Dashboard({ go }: { go: (p: PageId) => void }) {
  const { data, today, update } = useApp();
  const [modal, setModal] = useState<Modal>(null);

  const hour = new Date().getHours();
  const hello = hour < 5 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  // today's plan: due today, overdue and unfinished, or finished today
  const plan = data.tasks.filter((t) => t.due === today || (!t.done && t.due && t.due < today) || (t.done && t.doneAt === today));
  const planDone = plan.filter((t) => t.done).length;
  const planPct = plan.length ? Math.round((planDone / plan.length) * 100) : 0;

  const todayHabits = data.habits.filter((h) => h.createdAt <= today && isScheduled(h, today));
  const habitsDone = todayHabits.filter((h) => h.done.includes(today)).length;
  const habitsPct = todayHabits.length ? Math.round((habitsDone / todayHabits.length) * 100) : 0;

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const weekData = week.map((d) => ({
    day: WEEKDAYS[parseISO(d).getDay()],
    count: data.tasks.filter((t) => t.done && t.doneAt === d).length,
  }));
  const weekDone = weekData.reduce((s, x) => s + x.count, 0);

  const deadlines = data.tasks
    .filter((t) => !t.done && t.due && t.due >= today)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 5);
  const overdue = data.tasks.filter((t) => !t.done && t.due && t.due < today).length;

  const ym = today.slice(0, 7);
  const monthTx = data.transactions.filter((t) => t.date.startsWith(ym));
  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{hello}</h1>
          <p className="muted cap">{fmtLong(today)}</p>
        </div>
        <div className="row wrap">
          <button className="btn btn-primary" onClick={() => setModal('task')}><Plus size={16} />Задача</button>
          <button className="btn btn-soft-blue" onClick={() => setModal('habit')}><Plus size={16} />Привычка</button>
          <button className="btn btn-soft-green" onClick={() => setModal('income')}><ArrowUpCircle size={16} />Доход</button>
          <button className="btn btn-soft-pink" onClick={() => setModal('expense')}><ArrowDownCircle size={16} />Расход</button>
        </div>
      </header>

      <section className="grid g4">
        <StatCard tone="pink" label="План на сегодня" value={`${planPct}%`} hint={`выполнено ${planDone} из ${plan.length}, осталось ${plan.length - planDone}`}>
          <ProgressBar value={planPct} color="var(--pink)" />
        </StatCard>
        <StatCard tone="green" label="Привычки сегодня" value={todayHabits.length ? `${habitsDone}/${todayHabits.length}` : '—'} hint={todayHabits.length ? `${habitsPct}% выполнено` : 'на сегодня привычек нет'}>
          <ProgressBar value={habitsPct} />
        </StatCard>
        <StatCard tone="blue" label="Задач за неделю" value={String(weekDone)} hint={overdue ? `просрочено: ${overdue}` : 'просроченных нет'} />
        <StatCard tone="blue" label="Баланс месяца" value={fmtMoney(income - expense)} hint={`доход ${fmtMoney(income)} · расход ${fmtMoney(expense)}`} />
      </section>

      <section className="grid g2">
        <div className="card">
          <h3>Выполненные задачи за 7 дней</h3>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted)" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="var(--muted)" tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [String(v), 'Задач']} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} cursor={{ fill: 'var(--pink-soft)' }} />
                <Bar dataKey="count" fill="#f2b5c8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {weekDone === 0 && <p className="muted small">Отметьте задачу выполненной, и она появится на графике.</p>}
        </div>

        <div className="card">
          <h3>Привычки на сегодня</h3>
          {todayHabits.length === 0 ? (
            <div className="empty">
              <p>Сегодня привычек нет.</p>
              <button className="btn btn-ghost" onClick={() => go('habits')}>Открыть привычки</button>
            </div>
          ) : (
            <ul className="list">
              {todayHabits.map((h) => {
                const on = h.done.includes(today);
                return (
                  <li key={h.id}>
                    <button className={`check ${on ? 'on' : ''}`} style={on ? { background: h.color, borderColor: h.color } : undefined} onClick={() => update((d) => toggleHabitDay(d, h.id, today))} aria-label={`Отметить: ${h.name}`}>
                      {on && <Check size={14} />}
                    </button>
                    <span className={on ? 'done-text' : ''}>{h.name}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="card">
        <div className="row between">
          <h3>Ближайшие дедлайны</h3>
          <button className="btn btn-ghost" onClick={() => go('tasks')}>Все задачи</button>
        </div>
        {deadlines.length === 0 ? (
          <div className="empty"><p>Ближайших дедлайнов нет. Добавьте задачу со сроком.</p></div>
        ) : (
          <ul className="list">
            {deadlines.map((t) => {
              const n = diffDays(t.due, today);
              return (
                <li key={t.id} className="between">
                  <span>{t.title}</span>
                  <span className="muted small">{fmtDate(t.due)} · {n === 0 ? 'сегодня' : `через ${n} дн.`}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {modal === 'task' && <TaskForm onClose={() => setModal(null)} />}
      {modal === 'habit' && <HabitForm onClose={() => setModal(null)} />}
      {(modal === 'income' || modal === 'expense') && <TxForm defaultType={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
