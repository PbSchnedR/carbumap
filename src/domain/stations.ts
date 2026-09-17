import { parseParisDateTime } from './dates';
import type { LatLng } from './distance';
import { FUELS, FUEL_CODES, type FuelCode } from './fuels';
import { isStale } from './ranking';

export type FuelPrice = { price: number; updatedAt: Date };

export type Station = {
  id: number;
  address: string;
  postalCode: string;
  city: string;
  position: LatLng;
  prices: Partial<Record<FuelCode, FuelPrice>>;
};

type ApiFuelFields = {
  [K in FuelCode as `${K}_prix`]: number | null;
} & {
  [K in FuelCode as `${K}_maj`]: string | null;
} & {
  [K in FuelCode as `${K}_rupture_type`]: string | null;
};

/** Enregistrement de l'API /exports/json, restreint aux champs demandés (select). */
export type ApiRecord = {
  id: number;
  adresse: string | null;
  cp: string | null;
  ville: string | null;
  geom: { lon: number | null; lat: number | null } | null;
} & ApiFuelFields;

/** Ligne de prix affichée dans la fiche station pour un carburant autre que celui choisi. */
export type FuelPriceLine = {
  fuel: FuelCode;
  label: string;
  price: number;
  updatedAt: Date;
  isStale: boolean;
};

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/**
 * Convertit un enregistrement de l'API en Station.
 * Un carburant n'a un prix que s'il est numérique, > 0, daté et sans rupture en cours
 * (specs/001-carte-prix-carburants/research.md R6).
 * @returns null si la station n'a pas de position
 */
export function normalizeStation(record: ApiRecord): Station | null {
  const lat = record?.geom?.lat;
  const lon = record?.geom?.lon;
  if (!isFiniteNumber(lat) || !isFiniteNumber(lon)) return null;

  const prices: Station['prices'] = {};
  for (const code of FUEL_CODES) {
    const price: unknown = record[`${code}_prix`];
    if (!isFiniteNumber(price) || price <= 0) continue;
    if (record[`${code}_rupture_type`] != null) continue;
    const updatedAt = parseParisDateTime(record[`${code}_maj`]);
    if (!updatedAt) continue;
    prices[code] = { price, updatedAt };
  }

  return {
    id: record.id,
    address: record.adresse ?? '',
    postalCode: record.cp ?? '',
    city: record.ville ?? '',
    position: { lat, lon },
    prices,
  };
}

/** Prix des carburants proposés par la station, autres que celui choisi, dans l'ordre d'affichage. */
export function otherFuelPrices(station: Station, selected: FuelCode, now: Date): FuelPriceLine[] {
  const lines: FuelPriceLine[] = [];
  for (const { code, label } of FUELS) {
    if (code === selected) continue;
    const price = station.prices[code];
    if (!price) continue;
    lines.push({
      fuel: code,
      label,
      price: price.price,
      updatedAt: price.updatedAt,
      isStale: isStale(price.updatedAt, now),
    });
  }
  return lines;
}
