import { Capacitor } from '@capacitor/core';
import type { LatLng } from '../domain/distance';

export type GeolocationFailure = 'unsupported' | 'denied' | 'unavailable' | 'timeout';

const OPTIONS = { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 };

const FAILURE_BY_CODE: Record<number, GeolocationFailure> = { 1: 'denied', 2: 'unavailable', 3: 'timeout' };

/** Traduit l'erreur du plugin Android en une des causes affichées par l'interface. */
function toFailure(error: unknown): GeolocationFailure {
  const code = (error as { code?: unknown })?.code;
  if (typeof code === 'number' && FAILURE_BY_CODE[code]) return FAILURE_BY_CODE[code];

  const message = String((error as { message?: unknown })?.message ?? '').toLowerCase();
  if (message.includes('denied') || message.includes('permission')) return 'denied';
  if (message.includes('timed out') || message.includes('timeout')) return 'timeout';
  if (message.includes('not supported') || message.includes('unavailable')) return 'unsupported';
  return 'unavailable';
}

/** Chemin web : API native du navigateur, sans dépendance chargée. */
function browserPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject('unsupported' satisfies GeolocationFailure);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
      (error) => reject(FAILURE_BY_CODE[error.code] ?? 'unavailable'),
      OPTIONS,
    );
  });
}

/**
 * Position courante de l'appareil ; rejetée avec une GeolocationFailure.
 * Dans l'application Android, passe par Capacitor pour obtenir l'autorisation à l'exécution
 * (005 FR-008) ; le plugin n'est chargé que là, pour ne pas alourdir le site.
 */
export async function getCurrentPosition(): Promise<LatLng> {
  if (!Capacitor.isNativePlatform()) return browserPosition();

  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const { coords } = await Geolocation.getCurrentPosition(OPTIONS);
    return { lat: coords.latitude, lon: coords.longitude };
  } catch (error) {
    throw toFailure(error);
  }
}
