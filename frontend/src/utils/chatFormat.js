export function formatChatTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  });
}

function buildChatTitleFromText(text) {
  const compact = String(text || "").trim().replace(/\s+/g, " ");
  return compact.slice(0, 24) || "새 대화";
}

export function resolveChatTitle(chat) {
  const firstUserMessage = (chat?.messages || []).find((message) => message.sender === "user");

  if (firstUserMessage?.text) {
    return buildChatTitleFromText(firstUserMessage.text);
  }

  return buildChatTitleFromText(chat?.title);
}

export function formatChatDate(value) {
  if (!value) {
    return "기타";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "기타";
  }

  return date.toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function groupChatsByDate(chats) {
  return chats.reduce((groups, chat) => {
    const label = formatChatDate(chat.updatedAt || chat.createdAt);
    const existingGroup = groups.find((group) => group.label === label);

    if (existingGroup) {
      existingGroup.chats.push(chat);
      return groups;
    }

    groups.push({ label, chats: [chat] });
    return groups;
  }, []);
}
