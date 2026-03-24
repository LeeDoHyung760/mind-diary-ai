const GUEST_CHAT_STORAGE_KEY = "mindbridge-guest-chats";

function readGuestChats() {
  try {
    const raw = localStorage.getItem(GUEST_CHAT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(GUEST_CHAT_STORAGE_KEY);
    return [];
  }
}

function writeGuestChats(chats) {
  localStorage.setItem(GUEST_CHAT_STORAGE_KEY, JSON.stringify(chats));
}

function buildChatTitle(text) {
  const compact = String(text || "").trim().replace(/\s+/g, " ");
  return compact.slice(0, 24) || "새 대화";
}

function buildMessage(sender, text) {
  return {
    id: crypto.randomUUID(),
    sender,
    text,
    createdAt: new Date().toISOString(),
  };
}

function normalizeChatTitle(chat) {
  const firstUserMessage = (chat.messages || []).find((message) => message.sender === "user");

  return {
    ...chat,
    title: buildChatTitle(firstUserMessage?.text || chat.title),
  };
}

export function getStoredGuestChats() {
  return readGuestChats()
    .map(normalizeChatTitle)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function appendGuestChatMessage(text, chatId) {
  const chats = readGuestChats();
  const now = new Date().toISOString();
  const userMessage = buildMessage("user", text);
  const aiMessage = buildMessage("ai", "...");

  if (chatId) {
    const updatedChats = chats.map((chat) =>
      chat.id === chatId
        ? normalizeChatTitle({
            ...chat,
            messages: [...(chat.messages || []), userMessage, aiMessage],
            updatedAt: now,
          })
        : chat
    );

    writeGuestChats(updatedChats);
    return getStoredGuestChats().find((chat) => chat.id === chatId) || null;
  }

  const newChat = normalizeChatTitle({
    id: crypto.randomUUID(),
    title: buildChatTitle(text),
    messages: [userMessage, aiMessage],
    createdAt: now,
    updatedAt: now,
  });

  writeGuestChats([...chats, newChat]);
  return newChat;
}

export function deleteGuestChat(chatId) {
  const chats = readGuestChats();
  const updatedChats = chats.filter((chat) => chat.id !== chatId);
  writeGuestChats(updatedChats);
  return getStoredGuestChats();
}
