import type { SearchStatus } from '../hooks/useStationSearch';

type Props = { status: SearchStatus; isEmpty: boolean; onRetry: () => void };

const GEOLOCATION_MESSAGES = {
  denied: 'Vous avez refusé la localisation.',
  unsupported: 'La localisation n’est pas disponible sur cet appareil.',
  unavailable: 'Votre position n’a pas pu être déterminée.',
  timeout: 'La localisation a pris trop de temps.',
} as const;

/** Messages d'état de 001 (FR-010), visibles sans ouvrir le panneau. */
export function StatusMessage({ status, isEmpty, onRetry }: Props) {
  let lines: string[];
  switch (status.status) {
    case 'locating':
      lines = ['Localisation en cours…'];
      break;
    case 'loading':
      lines = ['Chargement des prix…'];
      break;
    case 'no-position':
      lines = [`Position indisponible. ${GEOLOCATION_MESSAGES[status.reason]}`, 'Déplacez la carte puis touchez « Chercher ici ».'];
      break;
    case 'error':
      lines = [status.error];
      break;
    case 'ready':
      if (!isEmpty) return null;
      lines = ['Aucune station ne propose ce carburant dans ce rayon.'];
      break;
  }

  const isError = status.status === 'error';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-card border px-4 py-3 text-label shadow-float ${isError ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface text-ink'}`}
    >
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      {isError && (
        <button
          type="button"
          onClick={onRetry}
          className="motion mt-2 min-h-11 rounded-pill border-2 border-danger px-4 font-semibold text-danger focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
