'use client';

import type { ElementType, ReactNode } from 'react';

// Shared pieces of the admin page design (same as the Mappingg super-admin):
// the page title card (icon, title, one-line description, main actions) and
// the coloured stat cards.

export function PageHead({ icon: Icon, title, sub, children }: { icon: ElementType; title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <header className="pg-head">
      <span className="pg-head-ic" aria-hidden="true"><Icon size={26} /></span>
      <div className="pg-head-t"><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
      {children && <div className="pg-head-acts">{children}</div>}
    </header>
  );
}

export type Tone = 'green' | 'blue' | 'amber' | 'violet' | 'rose' | 'teal';

/** A number card. With onClick it is a button (filters the list); `on` marks the active filter. */
export function StatCard({ icon: Icon, tone, value, label, on, onClick, title }: {
  icon: ElementType; tone: Tone; value: ReactNode; label: string; on?: boolean; onClick?: () => void; title?: string;
}) {
  const inner = (
    <>
      <span className="sc-ic" aria-hidden="true"><Icon size={19} /></span>
      <span className="sc-t"><b>{value}</b><small>{label}</small></span>
    </>
  );
  return onClick
    ? <button type="button" className={`sc ${tone}${on ? ' on' : ''}`} onClick={onClick} title={title}>{inner}</button>
    : <div className={`sc ${tone}`} title={title}>{inner}</div>;
}
