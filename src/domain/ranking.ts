import { distanceKm, type LatLng } from './distance';
import type { FuelCode } from './fuels';
import type { FuelPrice, Station } from './stations';

export type RankedStation = { station: Station; price: FuelPrice; distanceKm: number; isStale: boolean };

export const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

/** Un prix est « ancien » s'il a strictement plus de 7 jours. */
export function isStale(updatedAt: Date, now: Date): boolean {
  return now.getTime() - updatedAt.getTime() > STALE_AFTER_MS;
}

/** Identifiants de la ou des stations au prix le plus bas du classement (toutes en cas d'égalité). */
export function lowestPriceStationIds(ranked: readonly RankedStation[]): Set<number> {
  if (ranked.length === 0) return new Set();
  const lowest = Math.min(...ranked.map((entry) => entry.price.price));
  return new Set(ranked.filter((entry) => entry.price.price === lowest).map((entry) => entry.station.id));
}

/** Stations proposant le carburant dans le rayon, triées par prix, puis distance, puis id. */
export function rankStations(
  stations: readonly Station[],
  { fuel, radiusKm, origin, now }: { fuel: FuelCode; radiusKm: number; origin: LatLng; now: Date },
): RankedStation[] {
  const ranked: RankedStation[] = [];
  for (const station of stations) {
    const price = station.prices[fuel];
    if (!price) continue;
    const distance = distanceKm(origin, station.position);
    if (distance > radiusKm) continue;
    ranked.push({ station, price, distanceKm: distance, isStale: isStale(price.updatedAt, now) });
  }
  return ranked.sort(
    (a, b) => a.price.price - b.price.price || a.distanceKm - b.distanceKm || a.station.id - b.station.id,
  );
}
