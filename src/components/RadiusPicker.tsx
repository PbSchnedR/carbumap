import { RADII_KM, type RadiusKm } from '../domain/preferences';
import { SegmentedControl } from './SegmentedControl';

const OPTIONS = RADII_KM.map((km) => ({ value: km, label: `${km} km` }));

type Props = { value: RadiusKm; onChange: (radiusKm: RadiusKm) => void; fill?: boolean };

export function RadiusPicker({ value, onChange, fill }: Props) {
  return (
    <SegmentedControl
      label="Rayon de recherche"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      variant="secondary"
      fill={fill}
    />
  );
}
