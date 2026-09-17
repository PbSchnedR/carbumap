import type { ReactNode } from 'react';

type Props = { header: ReactNode; children: ReactNode };

/** Panneau latéral des stations sur ordinateur (FR-011). */
export function DesktopPanel({ header, children }: Props) {
  return (
    <aside className="relative z-[1100] flex w-[400px] shrink-0 flex-col overflow-hidden bg-surface shadow-panel">
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-line">{children}</div>
    </aside>
  );
}
