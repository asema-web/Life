import { useEffect, useState } from 'react';
import { AppProvider } from './storage/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Tasks from './pages/Tasks';
import type { PageId } from './types';

const PAGES: PageId[] = ['dashboard', 'habits', 'tasks'];
const fromHash = (): PageId => {
  const h = location.hash.slice(1) as PageId;
  return PAGES.includes(h) ? h : 'dashboard';
};

export default function App() {
  const [page, setPage] = useState<PageId>(fromHash);
  useEffect(() => {
    const f = () => setPage(fromHash());
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  const go = (p: PageId) => { location.hash = p; };

  return (
    <AppProvider>
      <Layout page={page} go={go}>
        {page === 'dashboard' ? <Dashboard go={go} /> : page === 'habits' ? <Habits /> : <Tasks />}
      </Layout>
    </AppProvider>
  );
}
