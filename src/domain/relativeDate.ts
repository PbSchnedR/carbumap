const PARIS_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const PARIS_SHORT_DATE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: '2-digit',
  month: '2-digit',
});

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RELATIVE_DAYS = 30;

/** Jour calendaire de Paris, ramené à minuit UTC pour pouvoir compter des jours entiers. */
function parisDayStart(date: Date): number {
  const [year, month, day] = PARIS_DAY.format(date).split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

/**
 * « aujourd’hui », « hier », « il y a N j » jusqu'à 30 jours, puis date courte.
 * Compté en **jours calendaires de Paris** : une mise à jour d'hier soir reste « hier », même si
 * moins de 24 h se sont écoulées (006 plan R3).
 */
export function formatRelativeDay(date: Date | null | undefined, now: Date): string {
  if (!date || Number.isNaN(date.getTime())) return '';

  const days = Math.round((parisDayStart(now) - parisDayStart(date)) / DAY_MS);
  if (days <= 0) return 'aujourd’hui';
  if (days === 1) return 'hier';
  if (days <= MAX_RELATIVE_DAYS) return `il y a ${days} j`;
  return PARIS_SHORT_DATE.format(date);
}
