const PARIS_PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris',
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const withComma = (text: string) => text.replace('.', ',');

/** « 350 m » sous 1 km, sinon « 3,3 km ». */
export function formatDistance(km: number): string {
  const meters = Math.round((km * 1000) / 10) * 10;
  if (meters < 1000) return `${meters} m`;
  return `${withComma(km.toFixed(1))} km`;
}

/** « 2,449 €/L » */
export function formatPrice(eurosPerLitre: number): string {
  return `${withComma(eurosPerLitre.toFixed(3))} €/L`;
}

function parisParts(date: Date): Record<string, string> {
  return Object.fromEntries(PARIS_PARTS.formatToParts(date).map(({ type, value }) => [type, value]));
}

/** « 17/09 à 15:47 », avec l'année si elle diffère de celle de `now` (heure de Paris). */
export function formatUpdatedAt(date: Date, now: Date): string {
  const p = parisParts(date);
  const sameYear = p.year === parisParts(now).year;
  return `${p.day}/${p.month}${sameYear ? '' : `/${p.year}`} à ${p.hour}:${p.minute}`;
}
