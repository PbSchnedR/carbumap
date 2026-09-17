import { useCallback, useState } from 'react';
import { readPreferences, serializePreferences, type Preferences } from '../domain/preferences';

const PREFS_KEY = 'carbumap:prefs';

function loadPreferences(): Preferences {
  try {
    return readPreferences(localStorage.getItem(PREFS_KEY));
  } catch {
    return readPreferences(null);
  }
}

/** Carburant et rayon, retenus sur l'appareil. */
export function usePreferences(): [Preferences, (changes: Partial<Preferences>) => void] {
  const [prefs, setPrefs] = useState(loadPreferences);

  const update = useCallback((changes: Partial<Preferences>) => {
    setPrefs((current) => {
      const next = { ...current, ...changes };
      try {
        localStorage.setItem(PREFS_KEY, serializePreferences(next));
      } catch {
        // Stockage indisponible (navigation privée…) : les préférences ne seront simplement pas retenues.
      }
      return next;
    });
  }, []);

  return [prefs, update];
}
