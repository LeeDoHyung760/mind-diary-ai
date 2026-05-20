import avatarGoldImage from "../assets/avatars/avatar-gold.png";
import avatarGreenImage from "../assets/avatars/avatar-green.png";
import avatarBlueImage from "../assets/avatars/avatar-blue.png";

const GOLD = "#fcc14c";
const BLUE = "#76c5ef";
const GREEN = "#68d78a";

export const avatarOptions = [
  {
    id: "gold",
    label: "골드",
    accent: GOLD,
    image: avatarGoldImage,
    surface: "#fff7d7",
    shadow: "rgba(181, 129, 16, 0.18)",
  },
  {
    id: "green",
    label: "그린",
    accent: GREEN,
    image: avatarGreenImage,
    surface: "#effff3",
    shadow: "rgba(47, 128, 76, 0.18)",
  },
  {
    id: "blue",
    label: "블루",
    accent: BLUE,
    image: avatarBlueImage,
    surface: "#ebf9ff",
    shadow: "rgba(46, 121, 163, 0.18)",
  },
];

const FALLBACK_AVATAR = avatarOptions[1];

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return { red, green, blue };
}

function mix(hex, target, amount) {
  const source = hexToRgb(hex);
  const destination = hexToRgb(target);

  const blend = (start, end) => Math.round(start + (end - start) * amount);
  const red = blend(source.red, destination.red);
  const green = blend(source.green, destination.green);
  const blue = blend(source.blue, destination.blue);

  return `rgb(${red}, ${green}, ${blue})`;
}

export function withAlpha(hex, alpha) {
  const { red, green, blue } = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getAvatarOption(avatarStyle, themeColor) {
  return (
    avatarOptions.find((option) => option.id === avatarStyle) ||
    avatarOptions.find((option) => option.accent.toLowerCase() === themeColor?.toLowerCase()) ||
    FALLBACK_AVATAR
  );
}

export function getThemeTokens(user) {
  const avatar = getAvatarOption(user?.avatarStyle, user?.themeColor);
  const accent = user?.themeColor || avatar.accent;

  return {
    avatar,
    accent,
    strong: mix(accent, "#111827", 0.28),
    contrast: mix(accent, "#ffffff", 0.88),
    soft: mix(accent, "#ffffff", 0.84),
    surface: mix(accent, "#ffffff", 0.93),
    border: mix(accent, "#ffffff", 0.68),
    glow: withAlpha(accent, 0.22),
    ring: withAlpha(accent, 0.18),
    tintText: mix(accent, "#1f2937", 0.35),
  };
}
