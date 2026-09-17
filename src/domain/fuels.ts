export type FuelCode = 'gazole' | 'sp95' | 'e10' | 'sp98' | 'e85' | 'gplc';

/** Carburants sélectionnables, dans l'ordre d'affichage. Les codes sont les préfixes des champs de l'API. */
export const FUELS: readonly { code: FuelCode; label: string }[] = Object.freeze([
  { code: 'gazole', label: 'Gazole' },
  { code: 'sp95', label: 'SP95' },
  { code: 'e10', label: 'E10' },
  { code: 'sp98', label: 'SP98' },
  { code: 'e85', label: 'E85' },
  { code: 'gplc', label: 'GPL' },
]);

export const FUEL_CODES: readonly FuelCode[] = Object.freeze(FUELS.map((fuel) => fuel.code));

export function isFuelCode(value: unknown): value is FuelCode {
  return FUEL_CODES.includes(value as FuelCode);
}
