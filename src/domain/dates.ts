const PARIS_PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris',
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/;

/** Décalage de Paris par rapport à UTC (en ms) à l'instant donné. */
function parisOffsetMs(epochMs: number): number {
  const parts = Object.fromEntries(
    PARIS_PARTS.formatToParts(new Date(epochMs)).map(({ type, value }) => [type, Number(value)]),
  );
  const wallClockAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return wallClockAsUtc - Math.floor(epochMs / 1000) * 1000;
}

/**
 * Lit une date « AAAA-MM-JJTHH:mm:ss » comme heure locale de Paris.
 * Tout suffixe de fuseau est ignoré : l'API suffixe « +00:00 » des heures qui sont en réalité
 * celles de Paris (specs/001-carte-prix-carburants/research.md R5).
 */
export function parseParisDateTime(value: string | null | undefined): Date | null {
  if (typeof value !== 'string') return null;
  const match = LOCAL_DATE_TIME.exec(value);
  if (!match) return null;

  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const check = new Date(wallClockAsUtc);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute ||
    check.getUTCSeconds() !== second
  ) {
    return null;
  }

  // Deux passes : le décalage estimé à partir de l'heure murale peut changer autour d'un changement d'heure.
  let epochMs = wallClockAsUtc - parisOffsetMs(wallClockAsUtc);
  epochMs = wallClockAsUtc - parisOffsetMs(epochMs);
  return new Date(epochMs);
}
