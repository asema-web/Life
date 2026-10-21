import { useState, type FormEvent } from 'react';
import Modal from './Modal';
import { useApp } from '../hooks/useApp';
import { uid } from '../utils/format';
import type { Transaction, TxType } from '../types';

export default function TxForm({ tx, defaultType = 'expense', onClose }: { tx?: Transaction; defaultType?: TxType; onClose: () => void }) {
  const { data, update, today } = useApp();
  const [type, setType] = useState<TxType>(tx?.type ?? defaultType);
  const [title, setTitle] = useState(tx?.title ?? '');
  const [amount, setAmount] = useState(tx ? String(tx.amount) : '');
  const [categoryId, setCategoryId] = useState(tx?.categoryId ?? data.categories[tx?.type ?? defaultType][0]?.id ?? '');
  const [date, setDate] = useState(tx?.date ?? today);
  const [note, setNote] = useState(tx?.note ?? '');

  const cats = data.categories[type];
  const num = Number(amount.replace(',', '.'));
  const valid = title.trim().length > 0 && Number.isFinite(num) && num > 0 && date !== '';

  const switchType = (t: TxType) => {
    setType(t);
    setCategoryId(data.categories[t][0]?.id ?? '');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const base = { type, title: title.trim(), amount: num, categoryId, date, note: note.trim() };
    update((d) =>
      tx
        ? { ...d, transactions: d.transactions.map((t) => (t.id === tx.id ? { ...t, ...base } : t)) }
        : { ...d, transactions: [...d.transactions, { id: uid(), ...base }] },
    );
    onClose();
  };

  return (
    <Modal title={tx ? 'Редактировать операцию' : 'Новая операция'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <div className="row">
          <button type="button" className={`chip grow ${type === 'income' ? 'on' : ''}`} onClick={() => switchType('income')}>Доход</button>
          <button type="button" className={`chip grow ${type === 'expense' ? 'on' : ''}`} onClick={() => switchType('expense')}>Расход</button>
        </div>
        <label className="field">Название
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </label>
        <div className="row">
          <label className="field grow">Сумма
            <input className="input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </label>
          <label className="field grow">Дата
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <label className="field">Категория
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="field">Примечание
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className="row end">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn btn-primary" disabled={!valid}>Сохранить</button>
        </div>
      </form>
    </Modal>
  );
}
