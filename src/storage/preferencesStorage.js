const PREFERENCES_STORAGE_KEY = "mindbridge-app-preferences";
const PREFERENCES_STORAGE_EVENT = "mindbridge-app-preferences-change";

export const DEFAULT_PASSWORD = "mindbridge1234";

const DEFAULT_PREFERENCES = {
  volume: 70,
  isMuted: false,
  localPassword: DEFAULT_PASSWORD,
};

let cachedRaw = null;
let cachedPreferences = DEFAULT_PREFERENCES;

function emitChange() {
  window.dispatchEvent(new Event(PREFERENCES_STORAGE_EVENT));
}

function sanitizePreferences(preferences) {
  const volumeValue = Number(preferences?.volume);
  const safeVolume = Number.isFinite(volumeValue)
    ? Math.max(0, Math.min(100, Math.round(volumeValue)))
    : DEFAULT_PREFERENCES.volume;

  return {
    volume: safeVolume,
    isMuted: Boolean(preferences?.isMuted),
    localPassword:
      typeof preferences?.localPassword === "string" && preferences.localPassword.length >= 8
        ? preferences.localPassword
        : DEFAULT_PASSWORD,
  };
}

export function getAppPreferences() {
  const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedPreferences;
  }

  cachedRaw = raw;

  if (!raw) {
    cachedPreferences = DEFAULT_PREFERENCES;
    return cachedPreferences;
  }

  try {
    cachedPreferences = sanitizePreferences(JSON.parse(raw));
    return cachedPreferences;
  } catch {
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    cachedRaw = null;
    cachedPreferences = DEFAULT_PREFERENCES;
    return cachedPreferences;
  }
}

export function saveAppPreferences(nextPreferences) {
  const sanitized = sanitizePreferences({
    ...getAppPreferences(),
    ...nextPreferences,
  });
  const raw = JSON.stringify(sanitized);

  localStorage.setItem(PREFERENCES_STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedPreferences = sanitized;
  emitChange();

  return sanitized;
}

export function subscribeAppPreferences(callback) {
  const handleChange = () => callback();
  const handleStorage = (event) => {
    if (event.key === PREFERENCES_STORAGE_KEY) {
      cachedRaw = null;
      callback();
    }
  };

  window.addEventListener(PREFERENCES_STORAGE_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(PREFERENCES_STORAGE_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}

