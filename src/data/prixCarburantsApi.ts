import type { LatLng } from '../domain/distance';
import { FUEL_CODES } from '../domain/fuels';
import { normalizeStation, type ApiRecord, type Station } from '../domain/stations';

// /exports/json et non /records : /records plafonne à 100 résultats (001 research.md R2).
const EXPORT_URL =
  'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/exports/json';

/** Rayon chargé à chaque recherche ; le rayon choisi (5/10/20 km) est appliqué localement (001 research.md R3). */
export const FETCH_RADIUS_KM = 20;

const TIMEOUT_MS = 15000;

const SELECT_FIELDS = [
  'id',
  'adresse',
  'cp',
  'ville',
  'geom',
  ...FUEL_CODES.flatMap((code) => [`${code}_prix`, `${code}_maj`, `${code}_rupture_type`]),
].join(',');

export class StationsFetchError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'StationsFetchError';
  }
}

/** Charge les stations situées à moins de FETCH_RADIUS_KM du point donné. */
export async function fetchStationsAround(origin: LatLng): Promise<Station[]> {
  const params = new URLSearchParams({
    // POINT(longitude latitude) : la longitude vient en premier.
    where: `within_distance(geom, geom'POINT(${origin.lon} ${origin.lat})', ${FETCH_RADIUS_KM}km)`,
    select: SELECT_FIELDS,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${EXPORT_URL}?${params}`, { signal: controller.signal });
  } catch (cause) {
    const message = controller.signal.aborted
      ? 'Le service des prix met trop de temps à répondre.'
      : 'Impossible de joindre le service des prix. Vérifiez votre connexion.';
    throw new StationsFetchError(message, { cause });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new StationsFetchError(`Le service des prix a renvoyé une erreur (${response.status}).`);
  }

  let records: unknown;
  try {
    records = await response.json();
  } catch (cause) {
    throw new StationsFetchError('Réponse illisible du service des prix.', { cause });
  }
  if (!Array.isArray(records)) {
    throw new StationsFetchError('Réponse inattendue du service des prix.');
  }

  return (records as ApiRecord[]).map(normalizeStation).filter((station): station is Station => station !== null);
}
