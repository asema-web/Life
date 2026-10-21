import type { ReactNode } from 'react';

export default function StatCard({ label, value, hint, tone = 'pink', children }: { label: string; value: string; hint?: string; tone?: 'pink' | 'blue' | 'green'; children?: ReactNode }) {
  return (
    <div className={`card stat tone-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="muted small">{hint}</div>}
      {children}
    </div>
  );
}
