import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, blockShadow } from "../theme";
import { BounceLetters } from "./PopText";
import { Sfx } from "./Sfx";

/** Pixel crown from the instant.fun logo. */
const Crown: React.FC<{ size: number; fill: string }> = ({ size, fill }) => (
  <svg viewBox="0 0 100 50" width={size} height={size / 2}>
    <path d="M6 44 L10 12 L32 30 L50 6 L68 30 L90 12 L94 44 Z" fill={fill} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    {[10, 50, 90].map((x, i) => (
      <circle key={i} cx={x} cy={[12, 6, 12][i]} r={6} fill={C.ink} />
    ))}
  </svg>
);

/** Four-point sparkle (the blue star beside the logo). */
export const Sparkle: React.FC<{ size: number; color?: string }> = ({ size, color = C.blue }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={color} />
  </svg>
);

/**
 * "instant.fun" wordmark built from live text so it stays sharp at 4K:
 * letters bounce in, then the crown drops onto "fun" and the sparkle spins.
 */
export const Logo: React.FC<{ delay?: number; size?: number; dot?: string; crownFill?: string; sfx?: boolean }> = ({
  delay = 0,
  crownFill = C.yellow,
  size = 190,
  dot = C.yellow,
  sfx = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const text = "instant.fun";
  const stagger = 3;
  const crownAt = delay + text.length * stagger + 6;
  const crown = spring({ frame: frame - crownAt, fps, config: { damping: 8, stiffness: 170 } });
  const sparkle = spring({ frame: frame - crownAt - 6, fps, config: { damping: 10 } });

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <BounceLetters
        text={text}
        delay={delay}
        stagger={stagger}
        size={size}
        colors={text.split("").map((ch) => (ch === "." ? dot : C.ink))}
      />
      <div
        style={{
          position: "absolute",
          right: size * 0.02,
          top: -size * 0.32,
          transform: `translateY(${interpolate(crown, [0, 1], [-400, 0])}px) rotate(${interpolate(crown, [0, 1], [-40, 8])}deg)`,
          opacity: frame < crownAt ? 0 : 1,
        }}
      >
        <Crown size={size * 0.85} fill={crownFill} />
      </div>
      <div
        style={{
          position: "absolute",
          right: -size * 0.55,
          top: size * 0.2,
          transform: `scale(${sparkle}) rotate(${frame * 3}deg)`,
        }}
      >
        <Sparkle size={size * 0.32} />
      </div>
      {sfx ? (
        <>
          {text.split("").map((_, i) =>
            i % 2 === 0 ? <Sfx key={i} name="synth/blip" at={delay + i * stagger} volume={0.18} rate={1 + i * 0.04} /> : null,
          )}
          <Sfx name="sfx/pop" at={crownAt + 8} volume={0.7} />
          <Sfx name="sfx/glass" at={crownAt + 12} volume={0.35} />
        </>
      ) : null}
    </div>
  );
};

/** Polaroid-style snap card that flies in with a spin. */
export const Polaroid: React.FC<{
  src: string;
  caption?: string;
  width?: number;
  x: number;
  y: number;
  rotate?: number;
  delay?: number;
  from?: [number, number];
  ratio?: number;
}> = ({ src, caption, width = 360, x, y, rotate = 0, delay = 0, from = [0, 900], ratio = 0.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 120 } });
  const bob = Math.sin((frame + delay * 5) / 20) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        padding: 16,
        paddingBottom: caption ? 20 : 16,
        background: C.white,
        borderRadius: 18,
        border: `6px solid ${C.ink}`,
        boxShadow: blockShadow(C.ink, 14),
        transform: `translate(${interpolate(s, [0, 1], [from[0], 0])}px, ${interpolate(s, [0, 1], [from[1], 0]) + bob}px) rotate(${interpolate(s, [0, 1], [rotate - 60, rotate])}deg) scale(${interpolate(s, [0, 1], [0.4, 1])})`,
        opacity: frame < delay ? 0 : 1,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{ width: "100%", height: width * ratio, objectFit: "cover", borderRadius: 10, display: "block" }}
      />
      {caption ? (
        <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: width * 0.1, color: C.ink, marginTop: 12 }}>{caption}</div>
      ) : null}
    </div>
  );
};
