import type { LatLng } from './distance';

/** Lieu proposé par la recherche d'adresses. */
export type Place = { id: string; label: string; context: string; position: LatLng };

const MIN_QUERY_LENGTH = 3;

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** Une recherche n'est lancée qu'à partir de 3 caractères utiles (FR-006). */
export function shouldSearchPlaces(query: string): boolean {
  return query.trim().length >= MIN_QUERY_LENGTH;
}

/**
 * Convertit un résultat de l'API Adresse en lieu.
 * `coordinates` est `[lon, lat]` (contracts/external-apis.md).
 */
export function normalizePlace(feature: unknown): Place | null {
  if (!feature || typeof feature !== 'object') return null;
  const { geometry, properties } = feature as { geometry?: unknown; properties?: unknown };
  const coordinates = (geometry as { coordinates?: unknown } | undefined)?.coordinates;
  const props = (properties ?? {}) as Record<string, unknown>;

  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [lon, lat] = coordinates;
  if (!isFiniteNumber(lon) || !isFiniteNumber(lat)) return null;
  if (typeof props.label !== 'string' || props.label === '') return null;

  return {
    id: typeof props.id === 'string' && props.id !== '' ? props.id : `${props.label}:${lon},${lat}`,
    label: props.label,
    context: typeof props.context === 'string' ? props.context : '',
    position: { lat, lon },
  };
}
