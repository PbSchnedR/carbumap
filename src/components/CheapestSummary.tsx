import { formatDistance, formatPrice } from '../domain/format';
import type { RankedStation } from '../domain/ranking';
import { originLabel, type SearchOrigin } from '../domain/searchOrigin';
import { CheapestBadge, addressLine } from './badges';

type Props = { ranked: RankedStation[]; lowestIds: Set<number>; origin: SearchOrigin | null };

/**
 * Résumé visible panneau replié : lieu de recherche, nombre de stations et la moins chère
 * (002 FR-006).
 *
 * Le lieu actif est affiché ici, et non dans la rangée de commandes : à lui seul il la faisait
 * déborder sur une troisième ligne sur mobile (007 FR-021). Il reste donc affiché en permanence,
 * y compris sans résultat, comme 003 FR-008 l'exige ; l'action pour revenir à la position de
 * l'appareil, elle, reste dans les commandes.
 */
export function CheapestSummary({ ranked, lowestIds, origin }: Props) {
  const [first] = ranked;
  const ties = lowestIds.size;
  if (!origin && !first) return null;

  return (
    <div className="flex items-center gap-3 px-4 pb-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {first && <CheapestBadge />}
          <span className="truncate text-label text-muted">
            {ranked.length} station{ranked.length > 1 ? 's' : ''}
            {origin && ` · ${originLabel(origin)}`}
          </span>
        </div>
        {first && (
          <>
            <p className="mt-1 truncate text-body font-semibold">{addressLine(first.station)}</p>
            <p className="truncate text-label text-muted tabular-nums">
              {formatDistance(first.distanceKm)}
              {ties > 1 && ` · ${ties} stations au même prix`}
            </p>
          </>
        )}
      </div>
      {first && (
        <span className="text-title font-bold whitespace-nowrap text-cheap tabular-nums">
          {formatPrice(first.price.price)}
        </span>
      )}
    </div>
  );
}
