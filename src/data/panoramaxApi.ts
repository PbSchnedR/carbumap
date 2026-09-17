import type { LatLng } from '../domain/distance';

// Panoramax : photos de rue libres, sans clé (contracts/external-apis.md).
const SEARCH_URL = 'https://api.panoramax.xyz/api/search';
const RADIUS_METERS = 80;
const TIMEOUT_MS = 8000;

/**
 * Photos prises à moins de 80 m de la position.
 * Toute erreur donne une liste vide : l'absence de photo est un cas normal (FR-013).
 */
export async function fetchNearbyPhotos(position: LatLng, signal: AbortSignal): Promise<unknown[]> {
  const params = new URLSearchParams({
    place_position: `${position.lon},${position.lat}`,
    place_distance: `0-${RADIUS_METERS}`,
    limit: '10',
  });

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal.addEventListener('abort', onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${SEARCH_URL}?${params}`, { signal: controller.signal });
    if (!response.ok) return [];
    const body: unknown = await response.json();
    const features = (body as { features?: unknown })?.features;
    return Array.isArray(features) ? features : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}
