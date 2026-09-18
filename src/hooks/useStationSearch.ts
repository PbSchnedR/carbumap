import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchStationsAround } from '../data/prixCarburantsApi';
import type { LatLng } from '../domain/distance';
import type { SearchOrigin } from '../domain/searchOrigin';
import type { Station } from '../domain/stations';
import { getCurrentPosition, type GeolocationFailure } from '../lib/geolocation';

export type SearchStatus =
  | { status: 'locating' }
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: string }
  | { status: 'no-position'; reason: GeolocationFailure };

export type StationSearch = {
  status: SearchStatus;
  /** Point de recherche : position de l'appareil, centre de la carte ou lieu choisi. */
  origin: SearchOrigin | null;
  /** Stations à 20 km, avant filtrage par carburant et rayon. */
  stations: Station[];
  search: (position: LatLng, kind: 'device' | 'place', label?: string) => void;
  /** Relance la géolocalisation puis la recherche autour de l'appareil. */
  locate: () => void;
  retry: () => void;
};

function toOrigin(position: LatLng, kind: 'device' | 'place', label?: string): SearchOrigin {
  if (kind === 'place') return { kind, position, label: label ?? '' };
  return { kind, position };
}

export function useStationSearch(): StationSearch {
  const [status, setStatus] = useState<SearchStatus>({ status: 'locating' });
  const [origin, setOrigin] = useState<SearchOrigin | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const searchId = useRef(0);

  const search = useCallback(
    async (position: LatLng, kind: 'device' | 'place', label?: string) => {
      const id = ++searchId.current;
      setOrigin(toOrigin(position, kind, label));
      setStations([]);
      setStatus({ status: 'loading' });
      try {
        const found = await fetchStationsAround(position);
        if (id !== searchId.current) return;
        setStations(found);
        setStatus({ status: 'ready' });
      } catch (error) {
        if (id !== searchId.current) return;
        setStatus({ status: 'error', error: error instanceof Error ? error.message : 'Une erreur est survenue.' });
      }
    },
    [],
  );

  /**
   * Géolocalise puis cherche. `requestId` réserve le rang de la demande : une réponse arrivée après
   * une recherche plus récente est ignorée (001 T041).
   */
  const locateAndSearch = useCallback(
    (requestId: number) => {
      setStatus({ status: 'locating' });
      getCurrentPosition().then(
        (position) => {
          if (requestId === searchId.current) void search(position, 'device');
        },
        (reason: GeolocationFailure) => {
          if (requestId === searchId.current) setStatus({ status: 'no-position', reason });
        },
      );
    },
    [search],
  );

  useEffect(() => {
    locateAndSearch(searchId.current);
  }, [locateAndSearch]);

  const locate = useCallback(() => {
    locateAndSearch(++searchId.current);
  }, [locateAndSearch]);

  const retry = useCallback(() => {
    if (origin) void search(origin.position, origin.kind, origin.kind === 'place' ? origin.label : undefined);
  }, [origin, search]);

  return {
    status,
    origin,
    stations,
    search: (position, kind, label) => void search(position, kind, label),
    locate,
    retry,
  };
}
