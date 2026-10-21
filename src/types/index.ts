export type PageId = 'dashboard' | 'habits' | 'tasks';
export type Priority = 'high' | 'medium' | 'low';
export type Theme = 'light' | 'dark';
export type TxType = 'income' | 'expense';

export interface Category { id: string; name: string; color: string }

export interface Habit {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  color: string;
  /** 0 = Sunday ... 6 = Saturday */
  days: number[];
  createdAt: string;
  /** ISO dates (YYYY-MM-DD) on which the habit was completed */
  done: string[];
}

export interface Task {
  id: string;
  title: string;
  createdAt: string;
  due: string;
  priority: Priority;
  categoryId: string;
  done: boolean;
  doneAt: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  note: string;
}

export interface AppData {
  version: 1;
  theme: Theme;
  monthlyBudget: number;
  habits: Habit[];
  tasks: Task[];
  transactions: Transaction[];
  categories: { habit: Category[]; task: Category[]; income: Category[]; expense: Category[] };
}
