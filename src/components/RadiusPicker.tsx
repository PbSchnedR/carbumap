import { RADII_KM, type RadiusKm } from '../domain/preferences';
import { ChipGroup } from './ChipGroup';

const OPTIONS = RADII_KM.map((km) => ({ value: km, label: `${km} km` }));

type Props = { value: RadiusKm; onChange: (radiusKm: RadiusKm) => void };

export function RadiusPicker({ value, onChange }: Props) {
  return <ChipGroup label="Rayon de recherche" options={OPTIONS} value={value} onChange={onChange} variant="secondary" />;
}
