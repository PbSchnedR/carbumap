import { useEffect, useRef } from 'react';
import { formatDistance, formatPrice } from '../domain/format';
import type { RankedStation } from '../domain/ranking';
import { formatRelativeDay } from '../domain/relativeDate';
import { CheapestBadge, StaleBadge, addressLine, locality } from './badges';

type Props = {
  ranked: RankedStation[];
  lowestIds: Set<number>;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpenCard: (id: number) => void;
  now: Date;
};

/** Lignes mobiles : le prix domine, le reste passe au second plan (006 US2). */
export function StationRows({ ranked, lowestIds, selectedId, onSelect, onOpenCard, now }: Props) {
  const selectedRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (selectedId !== null) selectedRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  if (ranked.length === 0) return null;

  return (
    <ol className="divide-y divide-line" aria-label="Stations classées du prix le plus bas au plus haut">
      {ranked.map((entry) => {
        const { station } = entry;
        const isCheapest = lowestIds.has(station.id);
        const isSelected = station.id === selectedId;
        return (
          <li key={station.id} ref={isSelected ? selectedRef : undefined}>
            <button
              type="button"
              onClick={() => (isSelected ? onOpenCard(station.id) : onSelect(station.id))}
              aria-current={isSelected ? 'true' : undefined}
              className={`motion flex min-h-11 w-full flex-col gap-0.5 px-4 py-2.5 text-left focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand ${
                isSelected ? 'bg-brand-soft' : isCheapest ? 'bg-cheap-soft' : 'bg-surface'
              }`}
            >
              <span className="flex w-full items-baseline gap-3">
                <span
                  className={`text-title font-bold tabular-nums ${isCheapest ? 'text-cheap' : 'text-ink'}`}
                >
                  {formatPrice(entry.price.price)}
                </span>
                {entry.isStale && <StaleBadge />}
                <span className="ml-auto text-label whitespace-nowrap text-muted tabular-nums">
                  {formatDistance(entry.distanceKm)}
                </span>
              </span>
              <span className="flex w-full items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-label text-muted">
                  {addressLine(station)} · {locality(station)}
                </span>
                <span className="text-label whitespace-nowrap text-muted">
                  {formatRelativeDay(entry.price.updatedAt, now)}
                </span>
              </span>
              {isCheapest && (
                <span>
                  <CheapestBadge />
                </span>
              )}
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
