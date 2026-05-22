const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

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

    throw new Error(
      errorBody?.detail ||
        errorBody?.message ||
        `요청 처리에 실패했습니다. (${response.status})`
    );
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

export async function guestChat(text) {
  const data = await request("/diary/chat", {
    method: "POST",
    body: JSON.stringify({ text }),
  });

  return {
    ...data,

    // 백엔드 원본 응답
    ai_response: data.ai_response,
    emotion: data.emotion,

    // 프론트 기존 코드 호환용
    message: data.ai_response,
    reply: data.ai_response,
  };
}

export { API_BASE_URL };