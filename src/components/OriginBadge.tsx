import { originLabel, type SearchOrigin } from '../domain/searchOrigin';
import { Icon } from './icons';

type Props = {
  origin: SearchOrigin | null;
  onLocate: () => void;
  /**
   * `true` sur mobile : seul le bouton de retour à la position est gardé, réduit à son icône.
   * Le nom du lieu actif est alors porté par le résumé du panneau (`CheapestSummary`), où il décrit
   * les résultats au lieu d'occuper une rangée de commandes à lui seul (007 FR-021).
   */
  compact?: boolean;
};

/** Lieu actif du point de recherche, et retour à la position de l'appareil (002 FR-008). */
export function OriginBadge({ origin, onLocate, compact = false }: Props) {
  if (!origin) return null;
  const canLocate = origin.kind !== 'device';

  // Action secondaire : contour, sans ombre en panneau — `shadow-float` est réservé à ce qui flotte
  // au-dessus de la carte (007 FR-020), ce qui est le cas de la version compacte.
  const locateButton = (
    <button
      type="button"
      onClick={onLocate}
      aria-label="Revenir à ma position"
      title="Revenir à ma position"
      className={`motion inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-pill border border-line bg-surface text-label font-semibold text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        compact ? 'min-w-11 shadow-float' : 'px-3'
      }`}
    >
      <Icon name="locate" />
      {!compact && 'Ma position'}
    </button>
  );

  if (compact) return canLocate ? locateButton : null;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="inline-flex min-h-11 min-w-0 items-center gap-1.5 rounded-pill border border-line bg-surface px-3 text-label font-semibold text-ink">
        <Icon name="mapPin" className="shrink-0 text-muted" />
        <span className="max-w-40 truncate">{originLabel(origin)}</span>
      </span>
      {canLocate && locateButton}
    </div>
  );
}
