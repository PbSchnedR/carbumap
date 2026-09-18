import { useEffect, useId, useRef, useState } from 'react';
import type { Place } from '../domain/places';
import { usePlaceSearch } from '../hooks/usePlaceSearch';
import { Icon } from './icons';

type Props = {
  onSelect: (place: Place) => void;
  /** `collapsible` : un bouton loupe déplie le champ au-dessus de la carte (mobile). */
  variant: 'inline' | 'collapsible';
};

export function PlaceSearch({ onSelect, variant }: Props) {
  const { query, setQuery, places, status, reset } = usePlaceSearch();
  const [isOpen, setIsOpen] = useState(variant === 'inline');
  const [activeIndex, setActiveIndex] = useState(-1);
  // Position verticale du champ déplié, mesurée à l'ouverture (voir le rendu `collapsible`).
  const [panelTop, setPanelTop] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setActiveIndex(-1), [places]);

  useEffect(() => {
    if (variant !== 'collapsible' || !isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [variant, isOpen]);

  const choose = (place: Place) => {
    onSelect(place);
    reset();
    setActiveIndex(-1);
    if (variant === 'collapsible') setIsOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && places.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % places.length);
    } else if (event.key === 'ArrowUp' && places.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? places.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      const place = places[activeIndex] ?? places[0];
      if (place) {
        event.preventDefault();
        choose(place);
      }
    } else if (event.key === 'Escape') {
      reset();
      if (variant === 'collapsible') setIsOpen(false);
    }
  };

  const message =
    status === 'loading'
      ? 'Recherche…'
      : status === 'empty'
        ? 'Aucun lieu trouvé (France uniquement).'
        : status === 'error'
          ? 'Recherche de lieu indisponible.'
          : null;

  const field = (
    <div className="relative">
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-label="Chercher un lieu"
        aria-expanded={places.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder="Ville ou adresse"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
        className="min-h-11 w-full rounded-pill border border-line bg-surface px-4 py-2 text-body text-ink shadow-float focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
      />
      {(places.length > 0 || message) && (
        <div className="absolute inset-x-0 top-12 z-10 overflow-hidden rounded-card border border-line bg-surface shadow-panel">
          {message && <p className="px-4 py-3 text-label text-muted">{message}</p>}
          <ul id={listId} role="listbox" aria-label="Lieux proposés" className="divide-y divide-line">
            {places.map((place, index) => (
              <li key={place.id} role="presentation">
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => choose(place)}
                  className={`motion min-h-11 w-full px-4 py-2 text-left ${index === activeIndex ? 'bg-brand-soft' : 'bg-surface'}`}
                >
                  <span className="block text-body font-semibold text-ink">{place.label}</span>
                  {place.context && <span className="block text-label text-muted">{place.context}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  if (variant === 'inline') return <div className="px-3 pb-1">{field}</div>;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Chercher un lieu"
        aria-expanded={isOpen}
        onClick={() => {
          const rect = rootRef.current?.getBoundingClientRect();
          if (rect) setPanelTop(rect.bottom + 8);
          setIsOpen((open) => !open);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="motion inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-pill border border-line bg-surface text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Icon name="search" />
      </button>
      {/* `fixed` calé sur les bords de l'écran, et non `absolute right-0` sur le bouton : le bouton
          se trouve au milieu de la rangée, si bien qu'une boîte large ancrée sur lui débordait de
          l'écran par la gauche. Le z-index passe au-dessus du message d'état, qu'il recouvrait. */}
      {isOpen && (
        <div className="fixed inset-x-3 z-[1300]" style={{ top: panelTop }}>
          {field}
        </div>
      )}
    </div>
  );
}
