import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TOY } from "../theme";

/**
 * Pixel-art doodles ported from components/landing/pixel-doodles.tsx, drawn
 * on a 16×16 grid with crisp edges so they stay chunky at video scale.
 */

type Px = [x: number, y: number, w: number, h: number, fill: string];

const px = (rects: Px[]) =>
  rects.map(([x, y, w, h, fill], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />);

const SHAPES = {
  star: px([
    [7, 1, 2, 2, TOY.yellow], [6, 3, 4, 2, TOY.yellow], [2, 5, 12, 2, TOY.yellow], [4, 7, 8, 2, TOY.yellow],
    [3, 9, 4, 2, TOY.yellow], [9, 9, 4, 2, TOY.yellow], [2, 11, 3, 2, TOY.yellow], [11, 11, 3, 2, TOY.yellow],
    [6, 7, 1, 1, TOY.dark], [9, 7, 1, 1, TOY.dark],
  ]),
  heart: px([
    [2, 3, 4, 2, TOY.red], [10, 3, 4, 2, TOY.red], [1, 5, 14, 4, TOY.red], [2, 9, 12, 2, TOY.red],
    [4, 11, 8, 2, TOY.red], [6, 13, 4, 1, TOY.red], [3, 5, 2, 2, "#f7b8b8"],
  ]),
  bolt: px([
    [8, 1, 4, 2, TOY.orange], [6, 3, 4, 2, TOY.orange], [4, 5, 4, 2, TOY.orange], [5, 7, 7, 2, TOY.orange],
    [8, 9, 4, 2, TOY.orange], [6, 11, 4, 2, TOY.orange], [4, 13, 4, 2, TOY.orange], [7, 3, 1, 2, "#ffd9b0"],
  ]),
  camera: px([
    [5, 2, 4, 2, TOY.blue], [1, 4, 14, 9, TOY.blue], [5, 6, 6, 5, TOY.blueDark], [6, 7, 4, 3, TOY.green],
    [12, 5, 2, 1, "#ffffff"],
  ]),
  coin: px([
    [5, 1, 6, 1, TOY.yellow], [3, 2, 10, 2, TOY.yellow], [2, 4, 12, 8, TOY.yellow], [3, 12, 10, 2, TOY.yellow],
    [5, 14, 6, 1, TOY.yellow], [7, 4, 2, 8, TOY.orangeDark], [5, 5, 4, 1, TOY.orangeDark],
    [7, 10, 4, 1, TOY.orangeDark], [3, 4, 1, 3, TOY.cream],
  ]),
  ghost: px([
    [4, 2, 8, 2, TOY.purple], [3, 4, 10, 8, TOY.purple], [3, 12, 2, 2, TOY.purple], [7, 12, 2, 2, TOY.purple],
    [11, 12, 2, 2, TOY.purple], [5, 6, 2, 3, TOY.dark], [9, 6, 2, 3, TOY.dark],
  ]),
  controller: px([
    [2, 5, 12, 6, TOY.green], [1, 6, 2, 4, TOY.green], [13, 6, 2, 4, TOY.green], [4, 7, 3, 1, TOY.dark],
    [5, 6, 1, 3, TOY.dark], [10, 6, 2, 2, TOY.yellow], [10, 9, 2, 1, TOY.yellow],
  ]),
};

export type DoodleName = keyof typeof SHAPES;

export const Doodle: React.FC<{ name: DoodleName; size?: number; style?: React.CSSProperties }> = ({
  name,
  size = 80,
  style,
}) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    style={{ shapeRendering: "crispEdges", filter: "drop-shadow(0 6px 0 rgba(28,27,27,0.18))", ...style }}
  >
    {SHAPES[name]}
  </svg>
);

export type Placement = { name: DoodleName; x: number; y: number; size?: number; rotate?: number; delay?: number };

/** Doodles pop in (staggered) and then float gently, like the landing page. */
export const DoodleField: React.FC<{ items: Placement[]; delay?: number }> = ({ items, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {items.map((it, i) => {
        const s = spring({ frame: frame - delay - (it.delay ?? i * 3), fps, config: { damping: 8, stiffness: 160 } });
        const float = Math.sin(frame / 18 + i * 1.7) * 14;
        const spin = Math.sin(frame / 25 + i) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: it.x,
              top: it.y,
              transform: `translateY(${float}px) scale(${s}) rotate(${(it.rotate ?? 0) + spin}deg)`,
            }}
          >
            <Doodle name={it.name} size={it.size ?? 90} />
          </div>
        );
      })}
    </>
  );
};

/** Deterministic confetti burst from (x, y), started at `at`. */
export const Confetti: React.FC<{ at: number; x: number; y: number; count?: number; seed?: string; spread?: number }> = ({
  at,
  x,
  y,
  count = 70,
  seed = "c",
  spread = 900,
}) => {
  const frame = useCurrentFrame() - at;
  if (frame < 0) return null;
  const colors = ["#ffe000", "#106df4", "#ff3d68", "#71fb96", "#f2994a", "#a68be0"];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = random(`${seed}a${i}`) * Math.PI * 2;
        const speed = 0.4 + random(`${seed}s${i}`) * 0.6;
        const t = frame / 30;
        const dx = Math.cos(angle) * spread * speed * (1 - Math.exp(-t * 3));
        const dy = Math.sin(angle) * spread * 0.7 * speed * (1 - Math.exp(-t * 3)) + 500 * t * t;
        const size = 14 + random(`${seed}z${i}`) * 18;
        const opacity = interpolate(frame, [0, 45, 70], [1, 1, 0], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + dx,
              top: y + dy,
              width: size,
              height: size * (i % 3 === 0 ? 1 : 0.5),
              background: colors[i % colors.length],
              border: "3px solid #1c1b1b",
              transform: `rotate(${frame * (8 + i)}deg)`,
              opacity,
            }}
          />
        );
      })}
    </>
  );
};
