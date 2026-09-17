import { FUELS, type FuelCode } from '../domain/fuels';
import { ChipGroup } from './ChipGroup';

const OPTIONS = FUELS.map(({ code, label }) => ({ value: code, label }));

type Props = { value: FuelCode; onChange: (fuel: FuelCode) => void };

export function FuelPicker({ value, onChange }: Props) {
  return <ChipGroup label="Carburant" options={OPTIONS} value={value} onChange={onChange} variant="primary" />;
}
