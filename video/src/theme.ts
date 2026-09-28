import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadPixel } from "@remotion/google-fonts/PressStart2P";

/** Brand tokens mirrored from app/globals.css so the video matches the site. */
export const C = {
  surface: "#fcf9f8",
  ink: "#1c1b1b",
  inkSoft: "#4c4732",
  yellow: "#ffe000",
  yellowDim: "#e2c600",
  blue: "#106df4",
  blueDeep: "#0056c6",
  green: "#71fb96",
  greenDeep: "#006d32",
  bnb: "#f0b90b",
  vote: "#ff3d68",
  voteSoft: "#ffe4ea",
  white: "#ffffff",
} as const;

/** Toy-block palette used by the pixel doodles on the landing page. */
export const TOY = {
  orange: "#f2994a",
  orangeDark: "#d97a2b",
  blue: "#4a90d9",
  blueDark: "#2f6fb0",
  yellow: "#f2c94c",
  green: "#6fcf70",
  purple: "#a68be0",
  red: "#eb6f6f",
  dark: "#3d3630",
  cream: "#fff6e9",
} as const;

export const FONT = {
  sans: loadJakarta("normal", { weights: ["600", "700", "800"], subsets: ["latin"] }).fontFamily,
  pixel: loadPixel("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
};

/** Chunky "sticker" outline + drop shadow used on every headline. */
export const stickerText = (shadow: string = C.ink, stroke: string = C.ink) => ({
  WebkitTextStroke: `10px ${stroke}`,
  paintOrder: "stroke fill" as const,
  textShadow: `0 10px 0 ${shadow}`,
});

/** Hard, offset "toy block" shadow for cards. */
export const blockShadow = (color: string = C.ink, y = 12) => `0 ${y}px 0 ${color}`;
