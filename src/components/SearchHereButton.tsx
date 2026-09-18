import { Icon } from './icons';

type Props = { onClick: () => void };

export function SearchHereButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Chercher les stations autour du centre de la carte"
      className="motion inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pill bg-brand px-4 text-label font-semibold whitespace-nowrap text-brand-ink shadow-float focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Icon name="crosshair" />
      Chercher ici
    </button>
  );
}
