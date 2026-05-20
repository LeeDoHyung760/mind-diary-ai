import {
  appendUserChatMessage,
  deleteUserChat,
  getUserChats,
  guestChat,
} from "../lib/api";
import {
  appendGuestChatMessage,
  deleteGuestChat,
  getStoredGuestChats,
} from "../storage/chatStorage";

function isLoggedInUser(user) {
  return Boolean(user?.id) && user?.source !== "guest";
}

export async function loadChatsForUser(user) {
  if (isLoggedInUser(user)) {
    const response = await getUserChats(user.id);
    return response.chats;
  }

  return getStoredGuestChats();
}

export async function sendChatMessage(user, chatId, text) {
  if (isLoggedInUser(user)) {
    const response = await appendUserChatMessage(user.id, { chatId, text });
    return response.chat;
  }

  let aiText = "...";
  let emotion = null;
  try {
    const response = await guestChat(text);
    aiText = response.reply || "...";
    emotion = response.emotion || null;
  } catch {
    // 백엔드 연결 실패 시 기본값 유지
  }

  return appendGuestChatMessage(text, chatId, aiText, emotion);
}

export async function removeChat(user, chatId) {
  if (isLoggedInUser(user)) {
    await deleteUserChat(user.id, chatId);
    return null;
  }

  return deleteGuestChat(chatId);
}
