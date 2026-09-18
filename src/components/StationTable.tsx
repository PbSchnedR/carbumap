import { useEffect, useRef } from 'react';
import { formatDistance, formatPriceValue } from '../domain/format';
import type { RankedStation } from '../domain/ranking';
import { formatRelativeDay } from '../domain/relativeDate';
import type { Sort, SortColumn } from '../domain/sorting';
import { CheapestBadge, StaleBadge, addressLine, locality } from './badges';
import { Icon } from './icons';

type Props = {
  ranked: RankedStation[];
  lowestIds: Set<number>;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpenCard: (id: number) => void;
  sort: Sort;
  onSortChange: (column: SortColumn) => void;
  /** Sous 1280 px, la colonne « mise à jour » est retirée plutôt que comprimée (006 FR-014, 007 FR-003). */
  compact: boolean;
  now: Date;
};

const COLUMNS: { column: SortColumn; label: string; align: 'left' | 'right' }[] = [
  { column: 'price', label: 'Prix €/L', align: 'right' },
  { column: 'distance', label: 'Distance', align: 'right' },
];

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;

function SortableHeader({
  label,
  fullLabel,
  column,
  sort,
  onSortChange,
  align,
}: {
  label: string;
  /** Intitulé complet annoncé aux lecteurs d'écran quand `label` est abrégé. */
  fullLabel?: string;
  column: SortColumn;
  sort: Sort;
  onSortChange: (column: SortColumn) => void;
  align: 'left' | 'right';
}) {
  const active = sort.column === column;
  return (
    <th
      scope="col"
      aria-sort={active ? ARIA_SORT[sort.direction] : 'none'}
      className={`sticky top-0 z-10 border-b border-line bg-surface ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <button
        type="button"
        onClick={() => onSortChange(column)}
        className={`motion inline-flex min-h-11 w-full items-center gap-1 px-2 text-label whitespace-nowrap focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand ${
          align === 'right' ? 'justify-end' : 'justify-start'
        } ${active ? 'font-semibold text-ink' : 'font-medium text-muted'}`}
      >
        <span className="truncate">{label}</span>
        {fullLabel && <span className="sr-only">{fullLabel}</span>}
        <span className={active ? '' : 'opacity-0'}>
          <Icon name={sort.direction === 'asc' ? 'arrowUp' : 'arrowDown'} />
        </span>
      </button>
    </th>
  );
}

/** Tableau comparatif sur ordinateur (006 US1). */
export function StationTable({
  ranked,
  lowestIds,
  selectedId,
  onSelect,
  onOpenCard,
  sort,
  onSortChange,
  compact,
  now,
}: Props) {
  const selectedRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (selectedId !== null) selectedRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selectedId]);

  if (ranked.length === 0) return null;

  return (
    <table className="w-full table-fixed border-collapse text-body">
      <caption className="sr-only">
        Stations classées ; les en-têtes de colonnes permettent de changer le tri.
      </caption>
      {/* Largeurs explicites : sans elles, les colonnes chiffrées prennent ce qu'elles veulent et
          l'adresse est écrasée à quelques caractères dans une colonne de 380 à 520 px (007 FR-003). */}
      <colgroup>
        <col className="w-[7rem]" />
        <col className="w-[6rem]" />
        <col />
        {!compact && <col className="w-[5.5rem]" />}
      </colgroup>
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <SortableHeader key={col.column} {...col} sort={sort} onSortChange={onSortChange} />
          ))}
          <th
            scope="col"
            className="sticky top-0 z-10 border-b border-line bg-surface px-2 text-left text-label font-medium text-muted"
          >
            Adresse
          </th>
          {!compact && (
            <SortableHeader
              label="Màj"
              fullLabel="Mise à jour"
              column="updatedAt"
              sort={sort}
              onSortChange={onSortChange}
              align="right"
            />
          )}
        </tr>
      </thead>
      <tbody>
        {ranked.map((entry) => {
          const { station } = entry;
          const isCheapest = lowestIds.has(station.id);
          const isSelected = station.id === selectedId;
          return (
            <tr
              key={station.id}
              ref={isSelected ? selectedRef : undefined}
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => (isSelected ? onOpenCard(station.id) : onSelect(station.id))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  isSelected ? onOpenCard(station.id) : onSelect(station.id);
                }
              }}
              tabIndex={0}
              className={`motion cursor-pointer border-t border-line focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-brand ${
                isSelected ? 'bg-brand-soft' : isCheapest ? 'bg-cheap-soft' : 'hover:bg-surface-2'
              }`}
            >
              <td
                className={`px-2 py-2 text-right font-bold whitespace-nowrap tabular-nums ${
                  isCheapest ? 'text-cheap' : 'text-ink'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {isCheapest && <CheapestBadge compact />}
                  {formatPriceValue(entry.price.price)}
                </span>
              </td>
              <td className="px-2 py-2 text-right whitespace-nowrap text-muted tabular-nums">
                {formatDistance(entry.distanceKm)}
              </td>
              <td className="px-2 py-2">
                <span className="block truncate font-medium">{addressLine(station)}</span>
                <span className="block truncate text-label text-muted">{locality(station)}</span>
              </td>
              {!compact && (
                <td className="px-2 py-2 text-right text-label text-muted">
                  <span className="inline-flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5">
                    {entry.isStale && <StaleBadge />}
                    {formatRelativeDay(entry.price.updatedAt, now)}
                  </span>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
