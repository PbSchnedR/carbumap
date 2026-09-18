import type { ReactNode } from 'react';

type Props = {
  /** Titre et contrôles de recherche : haut de la colonne, jamais un bandeau pleine largeur (FR-022). */
  controls: ReactNode;
  table: ReactNode;
  /** Fiche station, ou `null`. Elle occupe la colonne par-dessus le tableau (FR-007). */
  card: ReactNode | null;
  map: ReactNode;
  status: ReactNode;
};

/**
 * Disposition sur ordinateur (007 US1) : colonne des stations à gauche, carte pleine hauteur à droite.
 *
 * La fiche ne remplace pas le tableau, elle se pose **au-dessus** de lui. Le tableau reste donc dans
 * le flux et conserve sa position de défilement, ce qu'un `display: none` lui ferait perdre : les
 * navigateurs remettent `scrollTop` à zéro quand la boîte de mise en page disparaît (FR-007, SC-013).
 * `inert` met le tableau hors d'atteinte du clavier et des lecteurs d'écran pendant ce temps.
 */
export function DesktopLayout({ controls, table, card, map, status }: Props) {
  return (
    <div className="flex h-full overflow-hidden">
      <aside
        className="flex shrink-0 flex-col border-r border-line bg-surface"
        style={{ width: 'var(--panel-width)' }}
      >
        {/* Hauteur fixe : les contrôles ne défilent pas avec la liste, sans quoi la densité
            exigée par FR-004 n'aurait pas de sens.
            `z-30` place tout le bloc au-dessus du tableau : la liste de suggestions de la recherche
            de lieu et l'en-tête collant du tableau portaient tous deux `z-10`, et à égalité c'est
            l'ordre du DOM qui gagne — donc l'en-tête passait par-dessus les suggestions. */}
        <div className="relative z-30 shrink-0 border-b border-line bg-surface">{controls}</div>

        <div className="relative z-0 min-h-0 flex-1">
          {/* `isolate` enferme le `z-10` de l'en-tête collant du tableau dans son propre contexte
              d'empilement. Sans lui, cet en-tête se peignait par-dessus la fiche — et recouvrait
              précisément son bouton de retour, rendant la fiche impossible à quitter. */}
          <div className="absolute inset-0 isolate overflow-y-auto" inert={card !== null}>
            {table}
          </div>
          {card && <div className="absolute inset-0 z-10 overflow-y-auto bg-surface">{card}</div>}
        </div>
      </aside>

      <div className="relative min-w-0 flex-1">
        {map}
        <div className="pointer-events-none absolute inset-x-0 top-3 z-[1050] flex justify-center px-4">
          <div className="pointer-events-auto max-w-md">{status}</div>
        </div>
      </div>
    </div>
  );
}
