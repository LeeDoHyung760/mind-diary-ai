import { useSyncExternalStore } from "react";
import { getCurrentUser, subscribeCurrentUser } from "../storage/authStorage";

export function useCurrentUser() {
  return useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);
}
