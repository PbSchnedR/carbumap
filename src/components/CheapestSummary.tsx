import { formatDistance, formatPrice } from '../domain/format';
import type { RankedStation } from '../domain/ranking';
import { CheapestBadge, addressLine } from './badges';

type Props = { ranked: RankedStation[]; lowestIds: Set<number> };

/** Résumé visible panneau replié : nombre de stations et la moins chère (FR-006). */
export function CheapestSummary({ ranked, lowestIds }: Props) {
  if (ranked.length === 0) return null;
  const [first] = ranked;
  const ties = lowestIds.size;

  return (
    <div className="flex items-center gap-3 px-4 pb-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <CheapestBadge />
          <span className="text-label text-muted">
            {ranked.length} station{ranked.length > 1 ? 's' : ''}
          </span>
        </div>
        <p className="mt-1 truncate text-body font-semibold">{addressLine(first.station)}</p>
        <p className="truncate text-label text-muted tabular-nums">
          {formatDistance(first.distanceKm)}
          {ties > 1 && ` · ${ties} stations au même prix`}
        </p>
      </div>
      <span className="text-title font-bold whitespace-nowrap text-cheap tabular-nums">
        {formatPrice(first.price.price)}
      </span>
    </div>
  );
}
