import { useState } from 'react';
import { formatDistance, formatPrice, formatUpdatedAt } from '../domain/format';
import { googleMapsDirectionsUrl, googleMapsPlaceUrl } from '../domain/googleMaps';
import type { FuelCode } from '../domain/fuels';
import type { RankedStation } from '../domain/ranking';
import { otherFuelPrices } from '../domain/stations';
import { useStationPhoto } from '../hooks/useStationPhoto';
import { StaleBadge, locality } from './StationList';

type Props = { entry: RankedStation; fuel: FuelCode; now: Date; onClose: () => void };

const LINK_CLASS =
  'motion inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-pill px-4 text-label font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand';

export function StationCard({ entry, fuel, now, onClose }: Props) {
  const { station } = entry;
  const { photo, isLoading } = useStationPhoto(station);
  const [photoFailed, setPhotoFailed] = useState(false);
  const others = otherFuelPrices(station, fuel, now);

  return (
    <article className="flex flex-col gap-4 p-4">
      <header className="flex items-start gap-3">
        <button
          type="button"
          onClick={onClose}
          className="motion inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-pill border border-line bg-surface-2 text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Retour à la liste"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className="min-w-0">
          <h2 className="text-title font-bold break-words">{station.address || locality(station)}</h2>
          <p className="text-label text-muted tabular-nums">
            {locality(station)} · {formatDistance(entry.distanceKm)}
          </p>
        </div>
      </header>

      <div className="rounded-card bg-cheap-soft p-3">
        <p className="text-title font-extrabold text-cheap tabular-nums">{formatPrice(entry.price.price)}</p>
        <p className="flex flex-wrap items-center gap-1.5 text-label text-muted">
          Mis à jour le {formatUpdatedAt(entry.price.updatedAt, now)}
          {entry.isStale && <StaleBadge />}
        </p>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface-2">
        {photo && !photoFailed ? (
          <figure className="m-0">
            <img
              src={photo.thumbUrl}
              alt={`Vue de la rue près de ${station.address || locality(station)}`}
              loading="lazy"
              onError={() => setPhotoFailed(true)}
              className="block h-44 w-full object-cover"
            />
            <figcaption className="px-3 py-2 text-label text-muted">
              Photo prise le {formatUpdatedAt(photo.takenAt, now)}
              {photo.author && ` · ${photo.author}`}
              {photo.license && ` · ${photo.license}`} · Panoramax
            </figcaption>
          </figure>
        ) : (
          <p className="px-3 py-6 text-center text-label text-muted">
            {isLoading ? 'Recherche d’une photo…' : 'Aucune photo disponible pour ce lieu.'}
          </p>
        )}
      </div>

      {others.length > 0 && (
        <section>
          <h3 className="mb-1 text-label font-semibold text-muted">Autres carburants</h3>
          <ul className="divide-y divide-line rounded-card border border-line bg-surface">
            {others.map((line) => (
              <li key={line.fuel} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="font-semibold">{line.label}</span>
                <span className="flex items-center gap-2 text-right">
                  <span className="text-label text-muted tabular-nums">
                    {formatUpdatedAt(line.updatedAt, now)}
                    {line.isStale && ' '}
                  </span>
                  {line.isStale && <StaleBadge />}
                  <span className="font-bold tabular-nums">{formatPrice(line.price)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-2">
        <a
          href={googleMapsPlaceUrl(station.position)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${LINK_CLASS} border-2 border-brand text-brand`}
        >
          Voir dans Google Maps
        </a>
        <a
          href={googleMapsDirectionsUrl(station.position)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${LINK_CLASS} bg-brand text-brand-ink`}
        >
          Itinéraire
        </a>
      </div>
    </article>
  );
}
