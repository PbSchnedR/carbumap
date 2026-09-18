import { originLabel, type SearchOrigin } from '../domain/searchOrigin';
import { Icon } from './icons';

type Props = { origin: SearchOrigin | null; onLocate: () => void };

/** Lieu actif du point de recherche, et retour à la position de l'appareil (FR-008). */
export function OriginBadge({ origin, onLocate }: Props) {
  if (!origin) return null;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="inline-flex min-h-11 min-w-0 items-center gap-1.5 rounded-pill border border-line bg-surface px-3 text-label font-semibold text-ink shadow-float">
        <Icon name="mapPin" className="shrink-0 text-muted" />
        <span className="max-w-40 truncate">{originLabel(origin)}</span>
      </span>
      {origin.kind !== 'device' && (
        // Action secondaire : contour, sans ombre — `shadow-float` est réservé à ce qui flotte
        // au-dessus de la carte (007 FR-020).
        <button
          type="button"
          onClick={onLocate}
          className="motion inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill border border-line bg-surface px-3 text-label font-semibold text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Icon name="locate" />
          Ma position
        </button>
      )}
    </div>
  );
}
