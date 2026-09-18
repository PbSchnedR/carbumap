import { useId } from 'react';

type Option<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  variant: 'primary' | 'secondary';
  /**
   * `true` : le groupe occupe toute la largeur disponible et les options s'y partagent la place à
   * parts égales. C'est ce qui permet d'afficher les six carburants **sans défilement** sur un écran
   * de 360 px (002 FR-007 : « affichés en permanence… un seul toucher, sans menu »).
   */
  fill?: boolean;
};

/**
 * Contrôle segmenté : un seul bloc, les options à l'intérieur, l'option active en plein.
 *
 * Remplace les pastilles indépendantes de 004 : en flottant côte à côte, elles ne disaient pas
 * qu'elles formaient un choix unique, et leur ombre les mettait au même niveau visuel que le bouton
 * d'action. Ici le groupe se lit comme un groupe, et rien ne flotte à l'intérieur (007 FR-020).
 *
 * Aucun défilement horizontal : c'était la première version, et atteindre un carburant demandait de
 * faire glisser la rangée — exactement ce que 002 FR-007 cherchait à éviter.
 *
 * L'option active est signalée par le fond **et** la graisse : l'information ne repose donc pas sur
 * la seule couleur (002 FR-008, 007 FR-019). Les `input type="radio"` portent la sémantique pour les
 * lecteurs d'écran.
 */
export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
  variant,
  fill = false,
}: Props<T>) {
  const name = useId();
  const primary = variant === 'primary';

  return (
    <fieldset className={fill ? 'min-w-0 flex-1' : 'min-w-0 shrink-0'}>
      <legend className="sr-only">{label}</legend>
      <div
        className={`flex items-center gap-0.5 rounded-pill border border-line bg-surface-2 p-0.5 shadow-float ${
          fill ? 'w-full' : 'w-fit'
        }`}
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={[
                'motion relative inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill',
                'text-label whitespace-nowrap transition-colors',
                'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand',
                fill ? 'min-w-0 flex-1 px-1.5' : 'shrink-0 px-3.5',
                checked
                  ? primary
                    ? 'bg-brand font-semibold text-brand-ink'
                    : 'bg-ink font-semibold text-surface'
                  : 'font-medium text-muted',
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
              <span className="truncate">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
