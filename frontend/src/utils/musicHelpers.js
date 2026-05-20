import { fallbackEmotion, musicDB } from "../lib/musicData";

export function normalizeEmotion(emotion) {
  if (!emotion || typeof emotion !== "string") return fallbackEmotion;

  const value = emotion.trim().toLowerCase();

  const emotionMap = {
    calm: "calm",
    peaceful: "calm",
    relaxed: "calm",

    joy: "joy",
    happy: "joy",
    excited: "joy",

    sad: "sad",
    depressed: "sad",
    down: "sad",

    anger: "anger",
    angry: "anger",
    mad: "anger",

    anxiety: "anxiety",
    anxious: "anxiety",
    nervous: "anxiety",
    stress: "anxiety",
    stressed: "anxiety",
  };

  return emotionMap[value] || fallbackEmotion;
}

export function getSongsByEmotion(emotion) {
  const normalized = normalizeEmotion(emotion);
  return musicDB[normalized] || musicDB[fallbackEmotion];
}

export function shuffleArray(items) {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

export function getRecommendedSongs(emotion, count = 3) {
  const songs = getSongsByEmotion(emotion);
  return shuffleArray(songs).slice(0, count);
}

export function getPrimarySong(emotion) {
  const songs = getRecommendedSongs(emotion, 1);
  return songs[0] || null;
}