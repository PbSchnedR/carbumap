import { distanceKm, type LatLng } from './distance';

/** Photo de rue libre proche d'une station (Panoramax). */
export type PlacePhoto = {
  id: string;
  thumbUrl: string;
  takenAt: Date;
  author: string;
  license: string;
  position: LatLng;
};

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

function toPhoto(feature: unknown): PlacePhoto | null {
  if (!feature || typeof feature !== 'object') return null;
  const { id, geometry, assets, properties } = feature as Record<string, unknown>;

  const coordinates = (geometry as { coordinates?: unknown } | undefined)?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [lon, lat] = coordinates;
  if (!isFiniteNumber(lon) || !isFiniteNumber(lat)) return null;

  const thumbUrl = asString(((assets as Record<string, unknown> | undefined)?.thumb as { href?: unknown })?.href);
  if (!thumbUrl) return null;

  const props = (properties ?? {}) as Record<string, unknown>;
  const takenAt = new Date(asString(props.datetimetz));
  if (Number.isNaN(takenAt.getTime())) return null;

  return {
    id: asString(id),
    thumbUrl,
    takenAt,
    author: asString(props['geovisio:producer']),
    license: asString(props.license),
    position: { lat, lon },
  };
}

/** Photo exploitable la plus proche de la position donnée ; null s'il n'y en a aucune (cas fréquent). */
export function pickNearestPhoto(features: readonly unknown[], position: LatLng): PlacePhoto | null {
  let best: PlacePhoto | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const feature of features) {
    const photo = toPhoto(feature);
    if (!photo) continue;
    const distance = distanceKm(position, photo.position);
    if (distance < bestDistance) {
      best = photo;
      bestDistance = distance;
    }
  }
  return best;
}
