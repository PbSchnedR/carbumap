import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { LatLng } from '../domain/distance';
import { formatPrice } from '../domain/format';
import type { RankedStation } from '../domain/ranking';
import type { Station } from '../domain/stations';
import { iconSvg } from './icons';

type Props = {
  /** Toucher un repère ouvre directement la fiche de la station (003 FR-001). */
  onOpenCard: (id: number) => void;
  origin: LatLng | null;
  /** Stations issues de la dernière recherche : un nouveau tableau déclenche le recadrage. */
  stations: Station[];
  ranked: RankedStation[];
  lowestIds: Set<number>;
  selectedId: number | null;
  /** Hauteur (px) masquée en bas de la carte par le panneau mobile. */
  bottomPadding: number;
};

const FRANCE_VIEW: L.LatLngExpression = [46.6, 2.4];

// Z-index d'un repère Leaflet = position verticale en px + zIndexOffset (leaflet-src.js, Marker._setPos) :
// des décalages très grands garantissent le premier plan quelle que soit la position (FR-010).
const Z_CHEAPEST = 100_000;
const Z_SELECTED = 200_000;

function priceIcon(entry: RankedStation, isCheapest: boolean, isSelected: boolean): L.DivIcon {
  const classes = ['price-marker', isCheapest && 'price-marker--cheapest', isSelected && 'price-marker--selected']
    .filter(Boolean)
    .join(' ');
  // Seul un prix formaté (nombre) est injecté : aucune donnée texte de l'API dans le HTML.
  const star = isCheapest ? iconSvg('star') : '';
  return L.divIcon({
    className: classes,
    html: `<span class="price-marker__label">${star}${formatPrice(entry.price.price)}</span>`,
    // Boîte transparente de 44 × 44 px centrée sur la station : zone touchable au doigt (FR-004).
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
}

const zIndexFor = (isCheapest: boolean, isSelected: boolean) =>
  isSelected ? Z_SELECTED : isCheapest ? Z_CHEAPEST : 0;

export function MapView({
  origin,
  stations,
  ranked,
  lowestIds,
  selectedId,
  bottomPadding,
  onOpenCard,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const stationLayerRef = useRef<L.LayerGroup | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef(new Map<number, { marker: L.Marker; entry: RankedStation }>());
  const paddingRef = useRef(bottomPadding);
  paddingRef.current = bottomPadding;
  // Lus au moment du clic : les repères ne sont pas reconstruits à chaque rendu.
  const handlersRef = useRef({ onOpenCard });
  handlersRef.current = { onOpenCard };
  // Création unique de la carte.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Pas de boutons de zoom : le pincement sur mobile et la molette sur ordinateur suffisent.
    // L'attribution reste en haut à droite — en bas, le panneau des stations la masquerait — et
    // descend sous la barre des filtres via --map-controls-top.
    const map = L.map(container, { zoomControl: false, attributionControl: false }).setView(FRANCE_VIEW, 6);
    L.control.attribution({ position: 'topright', prefix: false }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    stationLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Le conteneur change de taille en passant de mobile à ordinateur : Leaflet doit le savoir.
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      stationLayerRef.current = null;
      originMarkerRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Point de recherche.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !origin) return;
    const latLng: L.LatLngExpression = [origin.lat, origin.lon];
    if (originMarkerRef.current) {
      originMarkerRef.current.setLatLng(latLng);
    } else {
      originMarkerRef.current = L.marker(latLng, {
        icon: L.divIcon({ className: 'origin-marker', iconSize: [18, 18] }),
        keyboard: false,
        interactive: false,
        zIndexOffset: Z_SELECTED + 1,
      }).addTo(map);
    }
  }, [origin]);

  // Repères de prix : reconstruits quand le classement ou le prix le plus bas change.
  useEffect(() => {
    const layer = stationLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markersRef.current.clear();
    for (const entry of ranked) {
      const { id, position } = entry.station;
      const isCheapest = lowestIds.has(id);
      const isSelected = id === selectedId;
      const marker = L.marker([position.lat, position.lon], {
        icon: priceIcon(entry, isCheapest, isSelected),
        keyboard: false,
        interactive: true,
        zIndexOffset: zIndexFor(isCheapest, isSelected),
      });
      // Un seul toucher ouvre la fiche, comme dans la liste : `onOpenCard` sélectionne aussi.
      marker.on('click', () => handlersRef.current.onOpenCard(id));
      layer.addLayer(marker);
      markersRef.current.set(id, { marker, entry });
    }
    // selectedId est traité par l'effet suivant ; il n'est lu ici que pour le premier rendu.
  }, [ranked, lowestIds]);

  // Mise en évidence de la station sélectionnée, et recentrage si elle est hors de la zone visible.
  const previousSelected = useRef<number | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    const refresh = (id: number | null) => {
      if (id === null) return;
      const found = markersRef.current.get(id);
      if (!found) return;
      const isCheapest = lowestIds.has(id);
      const isSelected = id === selectedId;
      found.marker.setIcon(priceIcon(found.entry, isCheapest, isSelected));
      found.marker.setZIndexOffset(zIndexFor(isCheapest, isSelected));
    };
    refresh(previousSelected.current);
    refresh(selectedId);
    if (map && selectedId !== null && selectedId !== previousSelected.current) {
      const found = markersRef.current.get(selectedId);
      if (found) map.panInside(found.marker.getLatLng(), { paddingBottomRight: [0, paddingRef.current + 24] });
    }
    previousSelected.current = selectedId;
  }, [selectedId, ranked, lowestIds]);

  // Recadrage après chaque nouvelle recherche.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !origin || stations.length === 0) return;
    const points = [...markersRef.current.values()].map(({ marker }) => marker.getLatLng());
    points.push(L.latLng(origin.lat, origin.lon));
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), {
        paddingTopLeft: [24, 24],
        paddingBottomRight: [24, paddingRef.current + 24],
        maxZoom: 15,
      });
    } else {
      map.setView([origin.lat, origin.lon], 13);
    }
    // Uniquement quand une recherche aboutit (nouveau tableau de stations).
  }, [stations]);

  return <div ref={containerRef} className="absolute inset-0" aria-label="Carte des stations" role="region" />;
}
