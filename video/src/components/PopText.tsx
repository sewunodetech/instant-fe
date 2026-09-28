import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, stickerText } from "../theme";
import { Sfx, type SfxName } from "./Sfx";

type Highlight = { bg: string; color?: string };

type PopTextProps = {
  text: string;
  /** Frame the first word pops in. */
  delay?: number;
  /** Frames between words. */
  stagger?: number;
  size?: number;
  color?: string;
  /** Words (without punctuation) that get a tilted sticker background. */
  highlights?: Record<string, Highlight>;
  /** Plays a pop sound per word (pitch climbs word by word). */
  sfx?: SfxName | false;
  sfxVolume?: number;
  align?: "center" | "left";
  lineHeight?: number;
  shadow?: string;
};

const clean = (w: string) => w.replace(/[^\p{L}\p{N}#$]/gu, "");

/**
 * Word-by-word "pop" headline: every word springs up from zero scale with an
 * overshoot and a playful tilt, then keeps a tiny wobble so it never feels
 * static. Highlighted words land on a coloured sticker.
 */
export const PopText: React.FC<PopTextProps> = ({
  text,
  delay = 0,
  stagger = 5,
  size = 120,
  color = C.white,
  highlights = {},
  sfx = "sfx/pop",
  sfxVolume = 0.35,
  align = "center",
  lineHeight = 1.15,
  shadow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: `0 ${size * 0.28}px`,
        fontFamily: FONT.sans,
        fontWeight: 800,
        fontSize: size,
        lineHeight,
        letterSpacing: "-0.02em",
      }}
    >
      {words.map((word, i) => {
        const start = delay + i * stagger;
        const pop = spring({ frame: frame - start, fps, config: { damping: 9, stiffness: 220, mass: 0.7 } });
        const tiltFrom = i % 2 ? -18 : 18;
        const rest = i % 2 ? -2 : 2;
        const wobble = pop > 0.99 ? Math.sin((frame - start) / 9 + i) * 1.2 : 0;
        const rotate = interpolate(pop, [0, 1], [tiltFrom, rest]) + wobble;
        const y = interpolate(pop, [0, 1], [size * 0.6, 0]);
        const hl = highlights[clean(word)];

        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px) scale(${pop}) rotate(${rotate}deg)`,
              opacity: frame < start ? 0 : 1,
              color: hl?.color ?? color,
              ...(hl
                ? {
                    background: hl.bg,
                    padding: `0 ${size * 0.18}px`,
                    borderRadius: size * 0.22,
                    border: `8px solid ${C.ink}`,
                    boxShadow: `0 ${size * 0.1}px 0 ${C.ink}`,
                    margin: `${size * 0.06}px 0`,
                  }
                : color === C.ink
                  ? stickerText(shadow ?? "rgba(28,27,27,0.18)", C.white)
                  : stickerText(shadow)),
            }}
          >
            {word}
            {sfx ? <Sfx name={sfx} at={start} volume={sfxVolume} rate={0.9 + (i % 5) * 0.1} /> : null}
          </span>
        );
      })}
    </div>
  );
};

/** Letters drop in one by one with a bouncy landing — used for the logo word. */
export const BounceLetters: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size?: number;
  colors?: string[];
  font?: string;
}> = ({ text, delay = 0, stagger = 3, size = 160, colors = [C.ink], font = FONT.sans }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", fontFamily: font, fontWeight: 800, fontSize: size, letterSpacing: "-0.03em" }}>
      {text.split("").map((ch, i) => {
        const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 7, stiffness: 180 } });
        const bob = Math.sin((frame - i * 4) / 8) * 4 * Math.min(1, s);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              color: colors[i % colors.length],
              transform: `translateY(${interpolate(s, [0, 1], [-size * 1.4, 0]) + bob}px) scaleY(${interpolate(s, [0, 0.6, 1], [1.3, 0.8, 1], { extrapolateRight: "clamp" })})`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};
