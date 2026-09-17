import type { LatLng } from './distance';

// Maps URLs : aucune clé nécessaire, api=1 obligatoire (contracts/external-apis.md).
const coordinates = ({ lat, lon }: LatLng) => `${lat}%2C${lon}`;

/** Ouvre la station dans Google Maps. */
export function googleMapsPlaceUrl(position: LatLng): string {
  return `https://www.google.com/maps/search/?api=1&query=${coordinates(position)}`;
}

/** Ouvre un itinéraire vers la station dans Google Maps (l'application n'en calcule aucun, FR-015). */
export function googleMapsDirectionsUrl(position: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coordinates(position)}`;
}
