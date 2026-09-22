"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Hand-built pixel-art style doodles (chunky, flat, retro) used as the
 * unifying playful visual language across the landing page — scattered,
 * gently floating decorations à la arcade sticker sheets.
 *
 * Each doodle is drawn on a 16x16 grid with `shape-rendering: crispEdges`
 * so the blocky pixels stay sharp at any size.
 */

type DoodleProps = {
  className?: string;
  size?: number;
};

function Svg({
  children,
  className,
  size = 48,
}: DoodleProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      style={{ shapeRendering: "crispEdges", imageRendering: "pixelated" }}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Small helper: a filled pixel block. */
function P({ x, y, w = 1, h = 1, fill }: { x: number; y: number; w?: number; h?: number; fill: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} />;
}

/**
 * Shared toy-block palette pulled from the hero video (orange + blue machine,
 * with red / yellow / green / purple building blocks). Keeping every doodle on
 * this palette makes the scattered decorations feel like the same toy set.
 */
const TOY = {
  orange: "#f2994a",
  orangeDark: "#d97a2b",
  blue: "#4a90d9",
  blueDark: "#2f6fb0",
  yellow: "#f2c94c",
  green: "#6fcf70",
  greenDark: "#4aa64b",
  purple: "#a68be0",
  red: "#eb6f6f",
  dark: "#3d3630",
  cream: "#fff6e9",
} as const;

export function PixelStar({ className, size }: DoodleProps) {
  const gold = TOY.yellow;
  const dark = TOY.dark;
  return (
    <Svg className={className} size={size}>
      <P x={7} y={1} w={2} h={2} fill={gold} />
      <P x={6} y={3} w={4} h={2} fill={gold} />
      <P x={2} y={5} w={12} h={2} fill={gold} />
      <P x={4} y={7} w={8} h={2} fill={gold} />
      <P x={3} y={9} w={4} h={2} fill={gold} />
      <P x={9} y={9} w={4} h={2} fill={gold} />
      <P x={2} y={11} w={2} h={2} fill={gold} />
      <P x={12} y={11} w={2} h={2} fill={gold} />
      {/* eyes */}
      <P x={6} y={7} w={1} h={1} fill={dark} />
      <P x={9} y={7} w={1} h={1} fill={dark} />
    </Svg>
  );
}

export function PixelHeart({ className, size }: DoodleProps) {
  const red = TOY.red;
  const hi = "#f7b8b8";
  return (
    <Svg className={className} size={size}>
      <P x={2} y={3} w={4} h={2} fill={red} />
      <P x={10} y={3} w={4} h={2} fill={red} />
      <P x={1} y={5} w={14} h={4} fill={red} />
      <P x={2} y={9} w={12} h={2} fill={red} />
      <P x={4} y={11} w={8} h={2} fill={red} />
      <P x={6} y={13} w={4} h={1} fill={red} />
      {/* highlight */}
      <P x={3} y={5} w={2} h={2} fill={hi} />
    </Svg>
  );
}

export function PixelBolt({ className, size }: DoodleProps) {
  const blue = TOY.orange;
  const hi = "#ffd9b0";
  return (
    <Svg className={className} size={size}>
      <P x={8} y={1} w={4} h={2} fill={blue} />
      <P x={6} y={3} w={4} h={2} fill={blue} />
      <P x={4} y={5} w={4} h={2} fill={blue} />
      <P x={5} y={7} w={7} h={2} fill={blue} />
      <P x={8} y={9} w={4} h={2} fill={blue} />
      <P x={6} y={11} w={4} h={2} fill={blue} />
      <P x={4} y={13} w={4} h={2} fill={blue} />
      <P x={7} y={3} w={1} h={2} fill={hi} />
    </Svg>
  );
}

export function PixelCamera({ className, size }: DoodleProps) {
  const body = TOY.blue;
  const lens = TOY.green;
  const dark = TOY.blueDark;
  return (
    <Svg className={className} size={size}>
      <P x={5} y={2} w={4} h={2} fill={body} />
      <P x={1} y={4} w={14} h={9} fill={body} />
      <P x={5} y={6} w={6} h={5} fill={dark} />
      <P x={6} y={7} w={4} h={3} fill={lens} />
      <P x={12} y={5} w={2} h={1} fill="#ffffff" />
    </Svg>
  );
}

export function PixelCoin({ className, size }: DoodleProps) {
  const gold = TOY.yellow;
  const dark = TOY.orangeDark;
  const hi = TOY.cream;
  return (
    <Svg className={className} size={size}>
      <P x={5} y={1} w={6} h={1} fill={gold} />
      <P x={3} y={2} w={10} h={2} fill={gold} />
      <P x={2} y={4} w={12} h={8} fill={gold} />
      <P x={3} y={12} w={10} h={2} fill={gold} />
      <P x={5} y={14} w={6} h={1} fill={gold} />
      {/* $ mark */}
      <P x={7} y={4} w={2} h={8} fill={dark} />
      <P x={5} y={5} w={4} h={1} fill={dark} />
      <P x={7} y={10} w={4} h={1} fill={dark} />
      <P x={3} y={4} w={1} h={3} fill={hi} />
    </Svg>
  );
}

export function PixelGhost({ className, size }: DoodleProps) {
  const body = TOY.purple;
  const dark = TOY.dark;
  return (
    <Svg className={className} size={size}>
      <P x={4} y={2} w={8} h={2} fill={body} />
      <P x={3} y={4} w={10} h={8} fill={body} />
      <P x={3} y={12} w={2} h={2} fill={body} />
      <P x={7} y={12} w={2} h={2} fill={body} />
      <P x={11} y={12} w={2} h={2} fill={body} />
      {/* eyes */}
      <P x={5} y={6} w={2} h={3} fill={dark} />
      <P x={9} y={6} w={2} h={3} fill={dark} />
    </Svg>
  );
}

export function PixelController({ className, size }: DoodleProps) {
  const body = TOY.green;
  const hi = TOY.yellow;
  const dark = TOY.dark;
  return (
    <Svg className={className} size={size}>
      <P x={2} y={5} w={12} h={6} fill={body} />
      <P x={1} y={6} w={2} h={4} fill={body} />
      <P x={13} y={6} w={2} h={4} fill={body} />
      {/* d-pad */}
      <P x={4} y={7} w={3} h={1} fill={dark} />
      <P x={5} y={6} w={1} h={3} fill={dark} />
      {/* buttons */}
      <P x={10} y={6} w={2} h={2} fill={hi} />
      <P x={10} y={9} w={2} h={1} fill={hi} />
    </Svg>
  );
}

const DOODLE_MAP = {
  star: PixelStar,
  heart: PixelHeart,
  bolt: PixelBolt,
  camera: PixelCamera,
  coin: PixelCoin,
  ghost: PixelGhost,
  controller: PixelController,
} as const;

export type DoodleName = keyof typeof DOODLE_MAP;

type Placement = {
  name: DoodleName;
  className: string;
  size?: number;
  rotate?: number;
  amount?: number;
  duration?: number;
  delay?: number;
};

/**
 * Scatters floating pixel doodles across a positioned container.
 * Parent must be `relative`. Hidden on very small screens to avoid clutter.
 */
export function DoodleField({ items, className }: { items: Placement[]; className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {items.map((it, i) => {
        const Doodle = DOODLE_MAP[it.name];
        const amount = it.amount ?? 12;
        const duration = it.duration ?? 6;
        return (
          <motion.div
            key={`${it.name}-${i}`}
            className={cn("absolute drop-shadow-sm", it.className)}
            style={{ rotate: it.rotate ? `${it.rotate}deg` : undefined }}
            animate={reduce ? undefined : { y: [-amount / 2, amount / 2, -amount / 2] }}
            transition={{ duration, delay: it.delay ?? 0, repeat: Infinity, ease: "easeInOut" }}
          >
            <Doodle size={it.size ?? 44} />
          </motion.div>
        );
      })}
    </div>
  );
}
