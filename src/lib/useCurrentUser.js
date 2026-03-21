import { useSyncExternalStore } from "react";
import { getCurrentUser, subscribeCurrentUser } from "./authStorage";

export function useCurrentUser() {
  return useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);
}
