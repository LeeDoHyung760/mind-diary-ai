import { updateUserProfile } from "../lib/api";
import {
  clearCurrentUser,
  clearGuestUser,
  getCurrentUser,
  saveCurrentUser,
  saveGuestUser,
} from "../storage/authStorage";
import { clearGuestChats } from "../storage/chatStorage";

export function loadCurrentUserProfile() {
  return getCurrentUser();
}

export function isGuestUser(user) {
  return user?.source === "guest" || !user;
}

export async function saveProfileChanges(user, payload) {
  if (user?.id && user?.source === "auth") {
    const response = await updateUserProfile(user.id, payload);
    saveCurrentUser(response.user);
    return { user: response.user, persistedTo: "api" };
  }

  const nextUser = {
    ...user,
    ...payload,
  };
  saveGuestUser(nextUser);
  return { user: nextUser, persistedTo: "storage" };
}

export async function completeOnboarding(user, payload) {
  return saveProfileChanges(user, {
    ...payload,
    isOnboardingCompleted: true,
  });
}

export function skipOnboarding(user, payload) {
  if (!user?.id) {
    saveGuestUser({
      ...payload,
      isOnboardingCompleted: false,
    });
  }
}

export function resetToLoginState() {
  clearCurrentUser();
  clearGuestUser();
  clearGuestChats();
}
