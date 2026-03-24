import {
  appendUserChatMessage,
  deleteUserChat,
  getUserChats,
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

  return appendGuestChatMessage(text, chatId);
}

export async function removeChat(user, chatId) {
  if (isLoggedInUser(user)) {
    await deleteUserChat(user.id, chatId);
    return null;
  }

  return deleteGuestChat(chatId);
}
