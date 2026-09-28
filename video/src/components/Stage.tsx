import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, blockShadow } from "../theme";

/** Solid brand backdrop with a slowly drifting dot grid + soft vignette. */
export const Stage: React.FC<{ bg: string; dot?: string; children: React.ReactNode }> = ({
  bg,
  dot = "rgba(28,27,27,0.12)",
  children,
}) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.6) % 48;
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${dot} 3px, transparent 3.5px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: `${drift}px ${drift}px`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.12))" }} />
      {children}
    </AbsoluteFill>
  );
};

/** "STEP 1" pixel badge that stamps in at the top of each how-it-works scene. */
export const StepBadge: React.FC<{ n: number; bg?: string; color?: string; delay?: number }> = ({
  n,
  bg = C.ink,
  color = C.yellow,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 90,
        padding: "22px 30px",
        background: bg,
        color,
        fontFamily: FONT.pixel,
        fontSize: 34,
        borderRadius: 18,
        boxShadow: blockShadow("rgba(28,27,27,0.35)", 8),
        transform: `scale(${interpolate(s, [0, 1], [2.2, 1])}) rotate(${interpolate(s, [0, 1], [-20, -4])}deg)`,
        opacity: Math.min(1, s * 2),
      }}
    >
      STEP {n}
    </div>
  );
};

/** Small rounded label chip (e.g. "Free to enter"). */
export const Chip: React.FC<{ children: React.ReactNode; bg: string; color?: string; style?: React.CSSProperties }> = ({
  children,
  bg,
  color = C.ink,
  style,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 26px",
      borderRadius: 999,
      background: bg,
      color,
      border: `5px solid ${C.ink}`,
      boxShadow: blockShadow(C.ink, 6),
      fontFamily: FONT.sans,
      fontWeight: 800,
      fontSize: 36,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);
