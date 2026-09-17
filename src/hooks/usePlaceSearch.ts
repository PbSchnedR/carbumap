import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPlaces } from '../data/adresseApi';
import { shouldSearchPlaces, type Place } from '../domain/places';

const DEBOUNCE_MS = 300;

export type PlaceSearchStatus = 'idle' | 'loading' | 'empty' | 'error';

export type PlaceSearchState = {
  query: string;
  setQuery: (query: string) => void;
  places: Place[];
  status: PlaceSearchStatus;
  reset: () => void;
};

/** Saisie d'un lieu : anti-rebond de 300 ms, requête précédente annulée (FR-006). */
export function usePlaceSearch(): PlaceSearchState {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [status, setStatus] = useState<PlaceSearchStatus>('idle');
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current?.abort();
    if (!shouldSearchPlaces(query)) {
      setPlaces([]);
      setStatus('idle');
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('loading');

    const timer = setTimeout(() => {
      fetchPlaces(query.trim(), controller.signal).then(
        (found) => {
          if (controller.signal.aborted) return;
          setPlaces(found);
          setStatus(found.length === 0 ? 'empty' : 'idle');
        },
        () => {
          if (controller.signal.aborted) return;
          setPlaces([]);
          setStatus('error');
        },
      );
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setQuery('');
    setPlaces([]);
    setStatus('idle');
  }, []);

  return { query, setQuery, places, status, reset };
}
