import type { RankedStation } from './ranking';

export type SortColumn = 'price' | 'distance' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';
export type Sort = { column: SortColumn; direction: SortDirection };

/** Tri par défaut : celui de 001 — prix croissant, puis distance, puis id. */
export const DEFAULT_SORT: Sort = { column: 'price', direction: 'asc' };

/** Valeur triable d'une ligne ; null quand la donnée manque (toujours reléguée en fin). */
function value(entry: RankedStation, column: SortColumn): number | null {
  if (column === 'price') return entry.price?.price ?? null;
  if (column === 'distance') return entry.distanceKm ?? null;
  const time = entry.price?.updatedAt?.getTime?.();
  return typeof time === 'number' && Number.isFinite(time) ? time : null;
}

/**
 * Trie une copie du classement. Les valeurs manquantes finissent toujours en bas, quel que soit le
 * sens ; l'égalité est départagée par la distance puis par l'id, pour un ordre total et stable.
 */
export function sortRanked(ranked: readonly RankedStation[], sort: Sort): RankedStation[] {
  const factor = sort.direction === 'asc' ? 1 : -1;

  return [...ranked].sort((a, b) => {
    const left = value(a, sort.column);
    const right = value(b, sort.column);

    if (left === null || right === null) {
      if (left === right) return a.station.id - b.station.id;
      return left === null ? 1 : -1;
    }

    if (left !== right) return (left - right) * factor;
    if (sort.column !== 'distance' && a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return a.station.id - b.station.id;
  });
}
