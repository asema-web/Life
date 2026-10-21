import { useState, type FormEvent } from 'react';
import Modal from './Modal';
import { useApp } from '../hooks/useApp';
import { WEEKDAYS, WEEK_ORDER } from '../utils/dates';
import { uid } from '../utils/format';
import type { Habit } from '../types';

export default function HabitForm({ habit, onClose }: { habit?: Habit; onClose: () => void }) {
  const { data, update, today } = useApp();
  const [name, setName] = useState(habit?.name ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [categoryId, setCategoryId] = useState(habit?.categoryId ?? data.categories.habit[0]?.id ?? '');
  const [color, setColor] = useState(habit?.color ?? '#8fcfa5');
  const [days, setDays] = useState<number[]>(habit?.days ?? [0, 1, 2, 3, 4, 5, 6]);

  const toggleDay = (d: number) => setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));
  const valid = name.trim().length > 0 && days.length > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const base = { name: name.trim(), description: description.trim(), categoryId, color, days };
    update((d) =>
      habit
        ? { ...d, habits: d.habits.map((h) => (h.id === habit.id ? { ...h, ...base } : h)) }
        : { ...d, habits: [...d.habits, { id: uid(), ...base, createdAt: today, done: [] }] },
    );
    onClose();
  };

  return (
    <Modal title={habit ? 'Редактировать привычку' : 'Новая привычка'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="field">Название
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, прогулка 30 минут" autoFocus />
        </label>
        <label className="field">Описание
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="row">
          <label className="field grow">Категория
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {data.categories.habit.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="field">Цвет
            <input className="input color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
        </div>
        <div className="field">Дни выполнения
          <div className="row wrap">
            {WEEK_ORDER.map((d) => (
              <button type="button" key={d} className={`chip ${days.includes(d) ? 'on' : ''}`} onClick={() => toggleDay(d)}>{WEEKDAYS[d]}</button>
            ))}
          </div>
          {days.length === 0 && <span className="error small">Выберите хотя бы один день</span>}
        </div>
        <div className="row end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn btn-primary" disabled={!valid}>Сохранить</button>
        </div>
      </form>
    </Modal>
  );
}
