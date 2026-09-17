import { useEffect, useRef } from 'react';
import { formatDistance, formatPrice, formatUpdatedAt } from '../domain/format';
import type { RankedStation } from '../domain/ranking';

type Props = {
  ranked: RankedStation[];
  lowestIds: Set<number>;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpenCard: (id: number) => void;
  now: Date;
};

export function CheapestBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-cheap px-2 py-0.5 text-label font-bold text-cheap-ink">
      <span aria-hidden="true">★</span>
      Le moins cher
    </span>
  );
}

export function StaleBadge() {
  return (
    <span
      className="inline-flex items-center rounded-pill bg-stale-soft px-2 py-0.5 text-label font-semibold text-stale"
      title="Prix non mis à jour depuis plus de 7 jours"
    >
      ancien
    </span>
  );
}

export function locality(station: RankedStation['station']): string {
  return `${station.postalCode} ${station.city}`.trim();
}

export function StationList({ ranked, lowestIds, selectedId, onSelect, onOpenCard, now }: Props) {
  const selectedRef = useRef<HTMLLIElement>(null);

  // Une station sélectionnée depuis la carte doit être visible dans la liste sans la chercher (FR-003).
  useEffect(() => {
    if (selectedId !== null) selectedRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  if (ranked.length === 0) return null;

  return (
    <ol className="divide-y divide-line" aria-label="Stations classées du prix le plus bas au plus haut">
      {ranked.map((entry, index) => {
        const { station } = entry;
        const isCheapest = lowestIds.has(station.id);
        const isSelected = station.id === selectedId;
        return (
          <li key={station.id} ref={isSelected ? selectedRef : undefined}>
            <button
              type="button"
              onClick={() => (isSelected ? onOpenCard(station.id) : onSelect(station.id))}
              aria-current={isSelected ? 'true' : undefined}
              className={[
                'motion grid min-h-11 w-full grid-cols-[auto_1fr_auto] gap-x-3 gap-y-0.5 px-4 py-3 text-left transition-colors',
                'focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand',
                isCheapest ? 'bg-cheap-soft' : 'bg-surface hover:bg-surface-2',
                isSelected ? 'shadow-[inset_4px_0_0_var(--color-brand)]' : '',
              ].join(' ')}
            >
              <span className="row-span-3 pt-0.5 text-label font-semibold text-muted tabular-nums">{index + 1}</span>
              <span className="min-w-0 text-body font-semibold break-words">{station.address || locality(station)}</span>
              <span
                className={`text-right text-price font-extrabold whitespace-nowrap tabular-nums ${isCheapest ? 'text-cheap' : 'text-ink'}`}
              >
                {formatPrice(entry.price.price)}
              </span>
              <span className="min-w-0 text-label text-muted">{station.address ? locality(station) : ''}</span>
              <span className="text-right text-label whitespace-nowrap text-muted tabular-nums">
                {formatDistance(entry.distanceKm)}
              </span>
              <span className="col-span-2 flex flex-wrap items-center gap-1.5 text-label text-muted">
                {isCheapest && <CheapestBadge />}
                <span>Mis à jour le {formatUpdatedAt(entry.price.updatedAt, now)}</span>
                {entry.isStale && <StaleBadge />}
                {isSelected && <span className="sr-only">(sélectionnée)</span>}
              </span>
            </button>
            {isSelected && (
              <div className="bg-brand-soft px-4 pb-3">
                <button
                  type="button"
                  onClick={() => onOpenCard(station.id)}
                  className="motion inline-flex min-h-11 items-center rounded-pill border-2 border-brand px-4 text-label font-semibold text-brand focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Détails
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
