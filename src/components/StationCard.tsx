import { useState } from 'react';
import { formatDistance, formatPrice, formatUpdatedAt } from '../domain/format';
import type { FuelCode } from '../domain/fuels';
import { googleMapsDirectionsUrl, googleMapsPlaceUrl } from '../domain/googleMaps';
import type { RankedStation } from '../domain/ranking';
import { formatRelativeDay } from '../domain/relativeDate';
import { otherFuelPrices } from '../domain/stations';
import { useStationPhoto } from '../hooks/useStationPhoto';
import { StaleBadge, addressLine, locality } from './badges';
import { Icon } from './icons';

type Props = { entry: RankedStation; fuel: FuelCode; now: Date; onClose: () => void };

const LINK_CLASS =
  'motion inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-pill px-4 text-label font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand';

/** Fiche station : prix choisi dominant, autres carburants en colonnes, puis le lieu (006 US3). */
export function StationCard({ entry, fuel, now, onClose }: Props) {
  const { station } = entry;
  const { photo, isLoading } = useStationPhoto(station);
  const [photoFailed, setPhotoFailed] = useState(false);
  const others = otherFuelPrices(station, fuel, now);
  const hasPhoto = Boolean(photo) && !photoFailed;

  return (
    <article className="flex flex-col gap-3 p-4">
      <header className="flex items-start gap-3">
        <button
          type="button"
          onClick={onClose}
          className="motion inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-pill border border-line bg-surface-2 text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Fermer la fiche"
        >
          <Icon name="arrowLeft" />
        </button>
        <div className="min-w-0">
          <h2 className="text-title font-bold break-words">{addressLine(station)}</h2>
          <p className="text-label text-muted tabular-nums">
            {locality(station)} · {formatDistance(entry.distanceKm)}
          </p>
        </div>
      </header>

      {/* Information principale : le prix du carburant choisi. */}
      <div className="rounded-card bg-cheap-soft px-4 py-3">
        <p className="text-3xl font-bold text-cheap tabular-nums">{formatPrice(entry.price.price)}</p>
        <p className="flex flex-wrap items-center gap-1.5 text-label text-muted">
          <span>Mis à jour {formatRelativeDay(entry.price.updatedAt, now)}</span>
          <span>({formatUpdatedAt(entry.price.updatedAt, now)})</span>
          {entry.isStale && <StaleBadge />}
        </p>
      </div>

      {others.length > 0 && (
        <table className="w-full border-collapse text-body">
          <caption className="pb-1 text-left text-label font-semibold text-muted">Autres carburants</caption>
          <tbody>
            {others.map((line) => (
              <tr key={line.fuel} className="border-t border-line">
                <th scope="row" className="py-1.5 text-left font-semibold">
                  {line.label}
                </th>
                <td className="py-1.5 text-right font-bold whitespace-nowrap tabular-nums">
                  {formatPrice(line.price)}
                </td>
                <td className="py-1.5 pl-3 text-right text-label whitespace-nowrap text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    {line.isStale && <StaleBadge />}
                    {formatRelativeDay(line.updatedAt, now)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Le lieu : photo quand il en existe une, sinon rien d'encombrant. */}
      {hasPhoto && photo ? (
        <figure className="m-0 overflow-hidden rounded-card border border-line bg-surface-2">
          <img
            src={photo.thumbUrl}
            alt={`Vue de la rue près de ${addressLine(station)}`}
            loading="lazy"
            onError={() => setPhotoFailed(true)}
            className="block h-40 w-full object-cover"
          />
          <figcaption className="px-3 py-2 text-label text-muted">
            Photo du {formatUpdatedAt(photo.takenAt, now)}
            {photo.author && ` · ${photo.author}`}
            {photo.license && ` · ${photo.license}`} · Panoramax
          </figcaption>
        </figure>
      ) : (
        <p className="text-label text-muted">
          {isLoading ? 'Recherche d’une photo…' : 'Aucune photo disponible pour ce lieu.'}
        </p>
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
