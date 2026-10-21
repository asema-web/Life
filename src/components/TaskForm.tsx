import { useState, type FormEvent } from 'react';
import Modal from './Modal';
import { useApp } from '../hooks/useApp';
import { PRIORITY, uid } from '../utils/format';
import type { Priority, Task } from '../types';

export default function TaskForm({ task, defaultDue = '', onClose }: { task?: Task; defaultDue?: string; onClose: () => void }) {
  const { data, update, today } = useApp();
  const [title, setTitle] = useState(task?.title ?? '');
  const [due, setDue] = useState(task?.due ?? defaultDue);
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [categoryId, setCategoryId] = useState(task?.categoryId ?? data.categories.task[0]?.id ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const base = { title: title.trim(), due, priority, categoryId };
    update((d) =>
      task
        ? { ...d, tasks: d.tasks.map((t) => (t.id === task.id ? { ...t, ...base } : t)) }
        : { ...d, tasks: [...d.tasks, { id: uid(), ...base, createdAt: today, done: false, doneAt: '' }] },
    );
    onClose();
  };

  return (
    <Modal title={task ? 'Редактировать задачу' : 'Новая задача'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="field">Название
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </label>
        <div className="row">
          <label className="field grow">Срок
            <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
          <label className="field grow">Приоритет
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {(Object.keys(PRIORITY) as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY[p].label}</option>)}
            </select>
          </label>
        </div>
        <label className="field">Категория
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {data.categories.task.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="row end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim()}>Сохранить</button>
        </div>
      </form>
    </Modal>
  );
}
