import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { CheapestSummary } from './components/CheapestSummary';
import { DesktopPanel } from './components/DesktopPanel';
import { FuelPicker } from './components/FuelPicker';
import { MapView, type MapHandle } from './components/MapView';
import { MobileSheet, visibleSheetHeight } from './components/MobileSheet';
import { OriginBadge } from './components/OriginBadge';
import { PlaceSearch } from './components/PlaceSearch';
import { RadiusPicker } from './components/RadiusPicker';
import { StationCard } from './components/StationCard';
import { SearchHereButton } from './components/SearchHereButton';
import { StationList } from './components/StationList';
import { StatusMessage } from './components/StatusMessage';
import { lowestPriceStationIds, rankStations } from './domain/ranking';
import { positionAfterSelection, type SheetPosition } from './domain/sheet';
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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const mapRef = useRef<MapHandle>(null);
  const [screenArea, setScreenArea] = useState<HTMLElement | null>(null);
  const [filtersBar, setFiltersBar] = useState<HTMLElement | null>(null);
  const screenHeight = useElementHeight(screenArea);
  const filtersHeight = useElementHeight(filtersBar);
  // Zone dans laquelle le panneau coulisse : l'écran moins la barre des filtres, qui flotte sur la carte.
  const sheetAreaHeight = Math.max(0, screenHeight - filtersHeight);

  const ready = status.status === 'ready';
  const ranked = useMemo(
    () => (ready && origin ? rankStations(stations, { ...prefs, origin: origin.position, now: new Date() }) : []),
    [ready, origin, stations, prefs],
  );
  const lowestIds = useMemo(() => lowestPriceStationIds(ranked), [ranked]);

  // Une station qui sort du classement (autre carburant, rayon, recherche) n'est plus sélectionnée,
  // et sa fiche se ferme (data-model.md).
  const selectedEntry = ranked.find((entry) => entry.station.id === selectedId) ?? null;
  const activeSelectedId = selectedEntry ? selectedId : null;
  const cardEntry = isCardOpen ? selectedEntry : null;

  const selectStation = (id: number) => {
    setSelectedId(id);
    setIsCardOpen(false);
    if (!isDesktop) setSheetPosition(positionAfterSelection(sheetPosition));
  };

  const openCard = (id: number) => {
    setSelectedId(id);
    setIsCardOpen(true);
    if (!isDesktop) setSheetPosition('full');
  };

  const closeCard = () => {
    setIsCardOpen(false);
    if (!isDesktop) setSheetPosition('half');
  };

  // Bouton « retour » d'Android : fiche, puis panneau, puis sortie (005 FR-015).
  useAndroidBackButton({
    isCardOpen,
    sheetPosition,
    onCloseCard: () => closeCard(),
    onCollapseSheet: () => setSheetPosition('collapsed'),
  });

  const choosePlace = (place: { position: { lat: number; lon: number }; label: string }) => {
    setIsCardOpen(false);
    search(place.position, 'place', place.label);
  };

  const searchHere = <SearchHereButton onClick={() => mapRef.current && search(mapRef.current.getCenter(), 'map')} />;

  // Deux rangées seulement : les commandes flottent sur la carte et doivent tenir dans 20 % de l'écran.
  const filters = (
    <div className="flex flex-col gap-2 py-2">
      <FuelPicker value={prefs.fuel} onChange={(fuel) => updatePrefs({ fuel })} />
      {isDesktop && <PlaceSearch variant="inline" onSelect={choosePlace} />}
      <div className="flex items-center gap-2 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="-mx-3 min-w-0"><RadiusPicker value={prefs.radiusKm} onChange={(radiusKm) => updatePrefs({ radiusKm })} /></div>
        <OriginBadge origin={origin} onLocate={locate} />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {!isDesktop && <PlaceSearch variant="collapsible" onSelect={choosePlace} />}
          {searchHere}
        </div>
      </div>
    </div>
  );

  const status_ = <StatusMessage status={status} isEmpty={ready && ranked.length === 0} onRetry={retry} />;
  const summary = <CheapestSummary ranked={ranked} lowestIds={lowestIds} />;
  const panelContent = cardEntry ? (
    <StationCard entry={cardEntry} fuel={prefs.fuel} now={new Date()} onClose={closeCard} />
  ) : (
    <StationList
      ranked={ranked}
      lowestIds={lowestIds}
      selectedId={activeSelectedId}
      onSelect={selectStation}
      onOpenCard={openCard}
      now={new Date()}
    />
  );

  const map = (
    <MapView
      ref={mapRef}
      origin={origin?.position ?? null}
      stations={stations}
      onSelectStation={selectStation}
      onOpenCard={openCard}
      ranked={ranked}
      lowestIds={lowestIds}
      selectedId={activeSelectedId}
      bottomPadding={isDesktop ? 0 : visibleSheetHeight(sheetPosition, sheetAreaHeight)}
    />
  );

  if (isDesktop) {
    return (
      <div className="flex h-full">
        <DesktopPanel
          header={
            <>
              <h1 className="px-4 pt-4 text-xl font-extrabold tracking-tight">Carbumap</h1>
              {filters}
              {cardEntry ? null : summary}
            </>
          }
        >
          {panelContent}
        </DesktopPanel>
        <main className="relative min-w-0 flex-1">
          {map}
          <div className="pointer-events-none absolute inset-x-0 top-3 z-[1050] flex justify-center px-4">
            <div className="pointer-events-auto max-w-md">{status_}</div>
          </div>
        </main>
      </div>
    );
  }

  // Mobile : la carte occupe tout l'écran ; la barre des filtres et les messages flottent au-dessus.
  return (
    <div
      ref={setScreenArea}
      className="relative h-full overflow-hidden"
      style={{ '--map-controls-top': `${filtersHeight}px` } as CSSProperties}
    >
      {map}
      <h1 className="sr-only">Carbumap</h1>
      <header ref={setFiltersBar} className="pointer-events-none absolute inset-x-0 top-0 z-[1200]">
        <div className="pointer-events-auto">{filters}</div>
      </header>
      <div className="pointer-events-none absolute inset-x-3 z-[1050]" style={{ top: filtersHeight + 12 }}>
        <div className="pointer-events-auto">{status_}</div>
      </div>
      <MobileSheet
        position={sheetPosition}
        onPositionChange={setSheetPosition}
        areaHeight={sheetAreaHeight}
        topOffset={filtersHeight}
        summary={cardEntry ? null : summary}
      >
        {panelContent}
      </MobileSheet>
    </div>
  );
}
