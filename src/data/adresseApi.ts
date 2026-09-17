import { normalizePlace, type Place } from '../domain/places';

// API Adresse (BAN), sans clé (contracts/external-apis.md).
const SEARCH_URL = 'https://api-adresse.data.gouv.fr/search/';
const TIMEOUT_MS = 8000;

export class PlaceSearchError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'PlaceSearchError';
  }
}

/** Lieux correspondant à la saisie (France uniquement). */
export async function fetchPlaces(query: string, signal: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({ q: query, limit: '5', autocomplete: '1' });
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal.addEventListener('abort', onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${SEARCH_URL}?${params}`, { signal: controller.signal });
    if (!response.ok) throw new PlaceSearchError('Recherche de lieu indisponible.');
    const body: unknown = await response.json();
    const features = (body as { features?: unknown })?.features;
    if (!Array.isArray(features)) throw new PlaceSearchError('Recherche de lieu indisponible.');
    return features.map(normalizePlace).filter((place): place is Place => place !== null);
  } catch (cause) {
    if (signal.aborted) throw cause;
    if (cause instanceof PlaceSearchError) throw cause;
    throw new PlaceSearchError('Recherche de lieu indisponible.', { cause });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}
