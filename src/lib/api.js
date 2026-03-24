const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || "요청 처리에 실패했습니다.");
  }

  return response.json();
}

export function createOnboardingProfile(payload) {
  return request("/users/onboarding", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getUserProfile(userId) {
  return request(`/users/${userId}`);
}

export function updateUserProfile(userId, payload) {
  return request(`/users/${userId}/profile`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getUserChats(userId) {
  return request(`/users/${userId}/chats`);
}

export function appendUserChatMessage(userId, payload) {
  return request(`/users/${userId}/chats/messages`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteUserChat(userId, chatId) {
  return request(`/users/${userId}/chats/${chatId}`, {
    method: "DELETE",
  });
}

export { API_BASE_URL };
