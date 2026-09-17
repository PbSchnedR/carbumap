// Enregistrements au format de l'API /exports/json, copiés de réponses réelles du 2026-09-17
// puis adaptés pour couvrir les cas limites.
import type { ApiRecord } from '../../../src/domain/stations';

const EMPTY_FUELS = {
  gazole_prix: null, gazole_maj: null, gazole_rupture_type: null,
  sp95_prix: null, sp95_maj: null, sp95_rupture_type: null,
  e10_prix: null, e10_maj: null, e10_rupture_type: null,
  sp98_prix: null, sp98_maj: null, sp98_rupture_type: null,
  e85_prix: null, e85_maj: null, e85_rupture_type: null,
  gplc_prix: null, gplc_maj: null, gplc_rupture_type: null,
};

export function record(overrides: Partial<ApiRecord> = {}): ApiRecord {
  return {
    id: 89100001,
    adresse: '84 ROUTE DE MAILLOT',
    cp: '89100',
    ville: 'Sens',
    geom: { lon: 3.309, lat: 48.183 },
    ...EMPTY_FUELS,
    gazole_prix: 2.449,
    gazole_maj: '2026-09-15T10:15:46+00:00',
    e85_prix: 0.859,
    e85_maj: '2026-08-25T10:02:31+00:00',
    e10_prix: 2.259,
    e10_maj: '2026-09-16T09:40:12+00:00',
    sp98_prix: 2.299,
    sp98_maj: '2026-09-17T09:26:09+00:00',
    sp95_rupture_type: 'definitive',
    gplc_rupture_type: 'definitive',
    ...overrides,
  };
}
