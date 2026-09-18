import { useMemo, useState, type CSSProperties } from 'react';
import { CheapestSummary } from './components/CheapestSummary';
import { DesktopLayout } from './components/DesktopLayout';
import { FuelPicker } from './components/FuelPicker';
import { MapView } from './components/MapView';
import { MobileSheet, visibleSheetHeight } from './components/MobileSheet';
import { OriginBadge } from './components/OriginBadge';
import { PlaceSearch } from './components/PlaceSearch';
import { RadiusPicker } from './components/RadiusPicker';
import { StationCard } from './components/StationCard';
import { StationRows } from './components/StationRows';
import { StationTable } from './components/StationTable';
import { StatusMessage } from './components/StatusMessage';
import { lowestPriceStationIds, rankStations } from './domain/ranking';
import type { SheetPosition } from './domain/sheet';
import { DEFAULT_SORT, sortRanked, type SortColumn } from './domain/sorting';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { useElementHeight } from './hooks/useElementHeight';
import { useMediaQuery } from './hooks/useMediaQuery';
import { usePreferences } from './hooks/usePreferences';
import { useStationSearch } from './hooks/useStationSearch';

export function App() {
  const [prefs, updatePrefs] = usePreferences();
  const { status, origin, stations, search, locate, retry } = useStationSearch();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [sheetPosition, setSheetPosition] = useState<SheetPosition>('collapsed');
  const [sort, setSort] = useState(DEFAULT_SORT);
  // Trois paliers : lignes mobiles, tableau réduit, tableau complet (006 plan R4).
  const isTable = useMediaQuery('(min-width: 768px)');
  // Le seuil suit la largeur de la **colonne**, pas celle de la fenêtre : `--panel-width` vaut
  // clamp(380px, 36vw, 520px), donc la colonne n'atteint 440 px qu'à partir de ~1220 px de fenêtre.
  // En dessous, la colonne « Mise à jour » est retirée plutôt que comprimée (007 FR-003, FR-008).
  const isCompactTable = !useMediaQuery('(min-width: 1280px)');
  const [screenArea, setScreenArea] = useState<HTMLElement | null>(null);
  const [filtersBar, setFiltersBar] = useState<HTMLElement | null>(null);
  const screenHeight = useElementHeight(screenArea);
  const filtersHeight = useElementHeight(filtersBar);
  const sheetAreaHeight = Math.max(0, screenHeight - filtersHeight);

  const ready = status.status === 'ready';
  // Le classement ne dépend pas du tri : c'est lui qui alimente la carte, dont les repères n'ont
  // donc plus à être détruits et reconstruits chaque fois qu'on change de colonne de tri.
  const classified = useMemo(() => {
    if (!ready || !origin) return [];
    return rankStations(stations, { ...prefs, origin: origin.position, now: new Date() });
  }, [ready, origin, stations, prefs]);
  const ranked = useMemo(() => sortRanked(classified, sort), [classified, sort]);
  const lowestIds = useMemo(() => lowestPriceStationIds(classified), [classified]);

  const selectedEntry = ranked.find((entry) => entry.station.id === selectedId) ?? null;
  const activeSelectedId = selectedEntry ? selectedId : null;
  const cardEntry = isCardOpen && selectedEntry ? selectedEntry : null;

  // Sur ordinateur seulement : dans le tableau, un clic met la station en évidence sur la carte,
  // un second ouvre sa fiche. Sur mobile et sur la carte, un seul toucher ouvre la fiche.
  const selectStation = (id: number) => {
    setSelectedId(id);
    setIsCardOpen(false);
  };

  const openCard = (id: number) => {
    setSelectedId(id);
    setIsCardOpen(true);
    if (!isTable) setSheetPosition('full');
  };

  const closeCard = () => {
    setIsCardOpen(false);
    if (!isTable) setSheetPosition('half');
  };

  const changeSort = (column: SortColumn) => {
    setSort((current) =>
      current.column === column
        ? { column, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: column === 'updatedAt' ? 'desc' : 'asc' },
    );
  };

  useAndroidBackButton({
    isCardOpen,
    sheetPosition,
    onCloseCard: closeCard,
    onCollapseSheet: () => setSheetPosition('collapsed'),
  });

  const choosePlace = (place: { position: { lat: number; lon: number }; label: string }) => {
    setIsCardOpen(false);
    search(place.position, 'place', place.label);
  };

  // Ordinateur : les contrôles s'empilent en haut de la colonne, où la place est verticale.
  const desktopControls = (
    <div className="flex flex-col gap-2 px-3 py-2">
      <div className="flex items-baseline gap-2 pt-1">
        <h1 className="text-title font-bold tracking-tight">Carbumap</h1>
        <p className="text-label text-muted">Les stations les moins chères</p>
      </div>
      <FuelPicker value={prefs.fuel} onChange={(fuel) => updatePrefs({ fuel })} fill />
      <PlaceSearch variant="inline" onSelect={choosePlace} />
      <div className="flex items-center gap-2 pb-1">
        <RadiusPicker value={prefs.radiusKm} onChange={(radiusKm) => updatePrefs({ radiusKm })} />
        <OriginBadge origin={origin} onLocate={locate} />
      </div>
    </div>
  );

  // Mobile : deux rangées, et **aucun défilement horizontal**. Les six carburants se partagent la
  // largeur de la première (002 FR-007 : visibles en permanence, un seul toucher) ; le rayon, le
  // retour à la position et la recherche tiennent sur la seconde. Le nom du lieu actif est affiché
  // par le résumé du panneau, pas ici : à lui seul il faisait déborder la rangée sur une troisième.
  const mobileControls = (
    <div className="flex flex-col gap-2 px-3 py-2">
      <FuelPicker value={prefs.fuel} onChange={(fuel) => updatePrefs({ fuel })} fill />
      {/* `flex-wrap` plutôt qu'un défilement : si le nom du lieu est long, la rangée passe à la
          ligne et tout reste atteignable au doigt, sans geste de glissement. */}
      <div className="flex flex-wrap items-center gap-2">
        <RadiusPicker value={prefs.radiusKm} onChange={(radiusKm) => updatePrefs({ radiusKm })} />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <OriginBadge origin={origin} onLocate={locate} compact />
          <PlaceSearch variant="collapsible" onSelect={choosePlace} />
        </div>
      </div>
    </div>
  );

  const statusMessage = <StatusMessage status={status} isEmpty={ready && ranked.length === 0} onRetry={retry} />;

  const map = (
    <MapView
      origin={origin?.position ?? null}
      stations={stations}
      ranked={classified}
      lowestIds={lowestIds}
      selectedId={activeSelectedId}
      bottomPadding={isTable ? 0 : visibleSheetHeight(sheetPosition, sheetAreaHeight)}
      onOpenCard={openCard}
    />
  );

  if (isTable) {
    // Colonne des stations à gauche, carte pleine hauteur à droite ; la page ne défile jamais.
    return (
      <DesktopLayout
        controls={desktopControls}
        table={
          <StationTable
            ranked={ranked}
            lowestIds={lowestIds}
            selectedId={activeSelectedId}
            onSelect={selectStation}
            onOpenCard={openCard}
            sort={sort}
            onSortChange={changeSort}
            compact={isCompactTable}
            now={new Date()}
          />
        }
        card={
          cardEntry ? <StationCard entry={cardEntry} fuel={prefs.fuel} now={new Date()} onClose={closeCard} /> : null
        }
        map={map}
        status={statusMessage}
      />
    );
  }

  // Mobile : carte plein écran, commandes flottantes, panneau glissant.
  return (
    <div
      ref={setScreenArea}
      className="relative h-full overflow-hidden"
      style={{ '--map-controls-top': `${filtersHeight}px` } as CSSProperties}
    >
      {map}
      <h1 className="sr-only">Carbumap</h1>
      <header ref={setFiltersBar} className="pointer-events-none absolute inset-x-0 top-0 z-[1200]">
        <div className="pointer-events-auto">{mobileControls}</div>
      </header>
      <div
        className="pointer-events-none absolute inset-x-3 z-[1050] flex flex-col items-center gap-2"
        style={{ top: filtersHeight + 12 }}
      >
        <div className="pointer-events-auto w-full">{statusMessage}</div>
      </div>
      <MobileSheet
        position={sheetPosition}
        onPositionChange={setSheetPosition}
        areaHeight={sheetAreaHeight}
        topOffset={filtersHeight}
        summary={cardEntry ? null : <CheapestSummary ranked={ranked} lowestIds={lowestIds} origin={origin} />}
      >
        {cardEntry ? (
          <StationCard entry={cardEntry} fuel={prefs.fuel} now={new Date()} onClose={closeCard} />
        ) : (
          <StationRows
            ranked={ranked}
            lowestIds={lowestIds}
            selectedId={activeSelectedId}
            onOpenCard={openCard}
            now={new Date()}
          />
        )}
      </MobileSheet>
    </div>
  );
}
