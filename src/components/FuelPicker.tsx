import { FUELS, type FuelCode } from '../domain/fuels';
import { SegmentedControl } from './SegmentedControl';

const OPTIONS = FUELS.map(({ code, label }) => ({ value: code, label }));

type Props = { value: FuelCode; onChange: (fuel: FuelCode) => void; fill?: boolean };

export function FuelPicker({ value, onChange, fill }: Props) {
  return (
    <SegmentedControl
      label="Carburant"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      variant="primary"
      fill={fill}
    />
  );
}
