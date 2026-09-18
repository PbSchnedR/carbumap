import type { Station } from '../domain/stations';
import { Icon } from './icons';

/** Marque de la station la moins chère : icône + texte, reconnaissable sans la couleur (FR-011). */
export function CheapestBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-pill bg-cheap px-2 py-0.5 text-label font-bold text-cheap-ink">
      <Icon name="star" />
      {compact ? <span className="sr-only">Le moins cher</span> : 'Le moins cher'}
    </span>
  );
}

/** Prix de plus de 7 jours (001 FR-014). */
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

/** « 92230 Gennevilliers » ; les données n'ont ni enseigne ni nom de station (001 research R8). */
export function locality(station: Station): string {
  return `${station.postalCode} ${station.city}`.trim();
}

export function addressLine(station: Station): string {
  return station.address || locality(station);
}
