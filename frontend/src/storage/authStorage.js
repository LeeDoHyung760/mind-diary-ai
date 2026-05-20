const AUTH_STORAGE_KEY = "mindbridge-current-user";
const GUEST_STORAGE_KEY = "mindbridge-guest-user";
const AUTH_STORAGE_EVENT = "mindbridge-current-user-change";

let cachedAuthRaw = null;
let cachedAuthUser = null;
let cachedGuestRaw = null;
let cachedGuestUser = null;

function emitChange() {
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

function readStoredUser(storageKey, rawCacheName, userCacheName) {
  const raw = localStorage.getItem(storageKey);

  if (rawCacheName === "auth") {
    if (raw === cachedAuthRaw) {
      return cachedAuthUser;
    }
    cachedAuthRaw = raw;
  } else {
    if (raw === cachedGuestRaw) {
      return cachedGuestUser;
    }
    cachedGuestRaw = raw;
  }

  if (!raw) {
    if (rawCacheName === "auth") {
      cachedAuthUser = null;
      return cachedAuthUser;
    }

    cachedGuestUser = null;
    return cachedGuestUser;
  }

  try {
    const parsed = JSON.parse(raw);

    if (userCacheName === "auth") {
      cachedAuthUser = parsed;
      return cachedAuthUser;
    }

    cachedGuestUser = parsed;
    return cachedGuestUser;
  } catch {
    localStorage.removeItem(storageKey);

    if (rawCacheName === "auth") {
      cachedAuthRaw = null;
      cachedAuthUser = null;
      return null;
    }

    cachedGuestRaw = null;
    cachedGuestUser = null;
    return null;
  }
}

export function saveCurrentUser(user) {
  const authUser = { ...user, source: "auth" };
  const raw = JSON.stringify(authUser);
  localStorage.setItem(AUTH_STORAGE_KEY, raw);
  cachedAuthRaw = raw;
  cachedAuthUser = authUser;
  clearGuestUser({ silent: true });
  emitChange();
}

export function saveGuestUser(user) {
  const guestUser = { ...user, source: "guest" };
  const raw = JSON.stringify(guestUser);
  localStorage.setItem(GUEST_STORAGE_KEY, raw);
  cachedGuestRaw = raw;
  cachedGuestUser = guestUser;
  emitChange();
}

export function getCurrentUser() {
  const authUser = readStoredUser(AUTH_STORAGE_KEY, "auth", "auth");

  if (authUser) {
    return authUser;
  }

  return readStoredUser(GUEST_STORAGE_KEY, "guest", "guest");
}

export function clearCurrentUser(options = {}) {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  cachedAuthRaw = null;
  cachedAuthUser = null;

  if (!options.silent) {
    emitChange();
  }
}

export function clearGuestUser(options = {}) {
  localStorage.removeItem(GUEST_STORAGE_KEY);
  cachedGuestRaw = null;
  cachedGuestUser = null;

  if (!options.silent) {
    emitChange();
  }
}

export function subscribeCurrentUser(callback) {
  const handleChange = () => callback();
  const handleStorage = (event) => {
    if (event.key === AUTH_STORAGE_KEY || event.key === GUEST_STORAGE_KEY) {
      cachedAuthRaw = null;
      cachedAuthUser = null;
      cachedGuestRaw = null;
      cachedGuestUser = null;
      callback();
    }
  };

  window.addEventListener(AUTH_STORAGE_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_STORAGE_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}
