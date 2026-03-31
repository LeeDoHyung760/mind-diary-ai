import { useSyncExternalStore } from "react";
import { getAppPreferences, subscribeAppPreferences } from "../storage/preferencesStorage";

export function useAppPreferences() {
  return useSyncExternalStore(subscribeAppPreferences, getAppPreferences, getAppPreferences);
}
