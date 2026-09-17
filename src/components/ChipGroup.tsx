import { useId } from 'react';

type Option<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  variant: 'primary' | 'secondary';
};

/**
 * Groupe de boutons radio présentés en pastilles : un toucher suffit pour choisir (FR-007).
 * L'option active est signalée par une coche, la graisse et la couleur (FR-008).
 */
export function ChipGroup<T extends string | number>({ label, options, value, onChange, variant }: Props<T>) {
  const name = useId();
  const primary = variant === 'primary';

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">{label}</legend>
      <div className="flex gap-2 overflow-x-auto px-3 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={[
                'motion relative inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-pill border px-3.5 text-label whitespace-nowrap shadow-float transition-colors',
                'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand',
                checked
                  ? primary
                    ? 'border-brand bg-brand font-bold text-brand-ink'
                    : 'border-ink bg-ink font-bold text-surface'
                  : 'border-line bg-surface font-medium text-ink',
              ].join(' ')}
            >
              <input
                type="radio"
                name={name}
                value={String(option.value)}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {checked && <span aria-hidden="true">✓</span>}
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
