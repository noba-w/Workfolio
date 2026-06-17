export const DICEBEAR_STYLES = [
  { id: "avataaars", label: "Avataaars" },
  { id: "bottts", label: "Bottts" },
  { id: "fun-emoji", label: "Fun Emoji" },
  { id: "identicon", label: "Identicon" },
  { id: "shapes", label: "Shapes" },
];

export function dicebearUrl(style, seed) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export function randomSeed() {
  return Math.random().toString(36).slice(2, 10);
}

export function randomSeeds(count) {
  return Array.from({ length: count }, randomSeed);
}
