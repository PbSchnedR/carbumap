import { originLabel, type SearchOrigin } from '../domain/searchOrigin';

type Props = { origin: SearchOrigin | null; onLocate: () => void };

/** Lieu actif du point de recherche, et retour à la position de l'appareil (FR-008). */
export function OriginBadge({ origin, onLocate }: Props) {
  if (!origin) return null;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="truncate rounded-pill border border-line bg-surface px-3 py-1.5 text-label font-semibold text-ink shadow-float">
        <span aria-hidden="true">📍</span> {originLabel(origin)}
      </span>
      {origin.kind !== 'device' && (
        <button
          type="button"
          onClick={onLocate}
          className="motion inline-flex min-h-11 shrink-0 items-center rounded-pill border border-line bg-surface px-3 text-label font-semibold text-ink shadow-float focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Ma position
        </button>
      )}
    </div>
  );
}
