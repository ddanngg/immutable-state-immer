export const allUsers = [
  "😊",
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐽",
  "🐸",
  "🐵",
  "🙈",
  "🐧",
  "🦉",
  "🐤",
  "🐣",
  "🐥",
  "🦆",
  "🐔",
  "🐝",
  "🐴",
  "🦄",
  "🦋",
  "🐍",
].map((emoji, idx) => ({
  id: idx,
  name: emoji,
}));

export function getCurrentUser() {
  // not a browser, not a current user
  if (typeof sessionStorage === "undefined") return null;

  // picks a random user, and store it to sessionStorage to preserve identify during using app
  const currentUserId =
    sessionStorage.getItem("user") ||
    Math.round(Math.random() * allUsers.length);
  sessionStorage.setItem("user", currentUserId);
  return allUsers[parseInt(currentUserId)];
}
