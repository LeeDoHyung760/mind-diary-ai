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

function normalizeMusicTracks(tracks) {
  return tracks.map((track) => ({
    title: track.title || "Unknown Title",
    artist: track.artist || track.channel || track.market || "YouTube",
    youtubeUrl: track.youtubeUrl,
    thumbnail: track.thumbnail,
    market: track.market,
    officialScore: track.officialScore,
  }));
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

    return {
      chat: response.chat,
      emotion: response.emotion || null,
      tags: response.tags || [],
      musicRecommendations: normalizeMusicTracks(response.musicRecommendations || []),
    };
  }

  let aiText = "...";
  let emotion = null;
  let tags = [];
  let musicRecommendations = [];

  try {
    const response = await guestChat(text);

    aiText = response.reply || "...";
    emotion = response.emotion || null;
    tags = response.tags || [];
    musicRecommendations = normalizeMusicTracks(response.musicRecommendations || []);
  } catch {
    // 백엔드 연결 실패 시 기본값 유지
  }

  const chat = appendGuestChatMessage(text, chatId, aiText, emotion);

  return {
    chat,
    emotion,
    tags,
    musicRecommendations,
  };
}

export async function removeChat(user, chatId) {
  if (isLoggedInUser(user)) {
    await deleteUserChat(user.id, chatId);
    return null;
  }

  return deleteGuestChat(chatId);
}