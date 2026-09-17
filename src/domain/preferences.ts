import { isFuelCode, type FuelCode } from './fuels';

export type RadiusKm = 5 | 10 | 20;
export type Preferences = { fuel: FuelCode; radiusKm: RadiusKm };

export const RADII_KM: readonly RadiusKm[] = Object.freeze([5, 10, 20]);

export const DEFAULT_PREFERENCES: Readonly<Preferences> = Object.freeze({ fuel: 'gazole', radiusKm: 10 });

const isRadiusKm = (value: unknown): value is RadiusKm => RADII_KM.includes(value as RadiusKm);

/** Lit les préférences sauvegardées ; chaque champ invalide reprend sa valeur par défaut. */
export function readPreferences(raw: string | null): Preferences {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw as string);
  } catch {
    // JSON invalide : valeurs par défaut.
  }
  const data = (parsed !== null && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
  return {
    fuel: isFuelCode(data.fuel) ? data.fuel : DEFAULT_PREFERENCES.fuel,
    radiusKm: isRadiusKm(data.radiusKm) ? data.radiusKm : DEFAULT_PREFERENCES.radiusKm,
  };
}

export function serializePreferences(prefs: Preferences): string {
  return JSON.stringify({ fuel: prefs.fuel, radiusKm: prefs.radiusKm });
}
