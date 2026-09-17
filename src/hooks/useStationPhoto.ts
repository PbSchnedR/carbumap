import { useEffect, useState } from 'react';
import { fetchNearbyPhotos } from '../data/panoramaxApi';
import { pickNearestPhoto, type PlacePhoto } from '../domain/photos';
import type { Station } from '../domain/stations';

/** Photo libre la plus proche de la station, ou null (absence, erreur, chargement interrompu). */
export function useStationPhoto(station: Station | null): { photo: PlacePhoto | null; isLoading: boolean } {
  const [photo, setPhoto] = useState<PlacePhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPhoto(null);
    if (!station) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    void fetchNearbyPhotos(station.position, controller.signal).then((features) => {
      if (controller.signal.aborted) return;
      setPhoto(pickNearestPhoto(features, station.position));
      setIsLoading(false);
    });

    return () => controller.abort();
  }, [station]);

  return { photo, isLoading };
}
