import type { LatLng } from './distance';

/** D'où vient le point de recherche : appareil, centre de la carte, ou lieu choisi. */
export type SearchOrigin =
  | { kind: 'device'; position: LatLng }
  | { kind: 'map'; position: LatLng }
  | { kind: 'place'; position: LatLng; label: string };

export function originLabel(origin: SearchOrigin | null): string {
  if (!origin) return '';
  if (origin.kind === 'device') return 'Ma position';
  if (origin.kind === 'map') return 'Zone de la carte';
  return origin.label;
}
