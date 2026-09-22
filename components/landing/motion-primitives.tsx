"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSET = 24;

function offsetFor(direction: Direction) {
  switch (direction) {
    case "up":
      return { y: OFFSET };
    case "down":
      return { y: -OFFSET };
    case "left":
      return { x: OFFSET };
    case "right":
      return { x: -OFFSET };
    default:
      return {};
  }
}

/** Props forwarded to the plain fallback element when motion is disabled. */
type StaticProps = {
  className?: string;
  style?: CSSProperties;
  id?: string;
};

type FadeInProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  /** Direction the element travels from as it fades in. */
  direction?: Direction;
  /** Delay in seconds before the animation starts. */
  delay?: number;
  /** Only animate the first time it enters the viewport. */
  once?: boolean;
};

/**
 * Fades and slides an element into view when it scrolls into the viewport.
 * Falls back to a static element when the user prefers reduced motion.
 */
export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  once = true,
  className,
  style,
  id,
  ...props
}: FadeInProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} style={style as CSSProperties} id={id}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      id={id}
      initial={{ opacity: 0, ...offsetFor(direction) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.2, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: OFFSET },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

type StaggerProps = StaticProps & {
  children: ReactNode;
  once?: boolean;
};

/**
 * Container that reveals its `StaggerItem` children one after another.
 */
export function Stagger({ children, once = true, className, style, id }: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} style={style} id={id}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      id={id}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = StaticProps & {
  children: ReactNode;
};

/** A single item within a `Stagger` container. */
export function StaggerItem({ children, className, style, id }: StaggerItemProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} style={style} id={id}>
        {children}
      </div>
    );
  }

  return (
    <motion.div className={className} style={style} id={id} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Masked upward reveal for headline / hero text.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={className} style={{ display: "inline-block", overflow: "hidden" }}>
      <motion.span
        style={{ display: "inline-block" }}
        initial={{ y: "110%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /**
   * How far (px) the element travels across the scroll range.
   * Positive moves down slower / negative moves up faster than scroll.
   */
  distance?: number;
  /** Optional opacity fade as the element leaves the viewport. */
  fade?: boolean;
};

/**
 * Scroll-linked vertical parallax. The element drifts as it passes through
 * the viewport, giving depth. Smoothed with a spring for a premium feel.
 */
export function Parallax({ children, className, distance = 60, fade = false }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yRaw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(yRaw, { stiffness: 120, damping: 30, mass: 0.4 });
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.4, 1, 1, 0.4]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y, opacity: fade ? opacity : undefined }}>
      {children}
    </motion.div>
  );
}

type WordRevealProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
};

/**
 * Reveals a headline word-by-word as it scrolls into view.
 * Each word rises and fades in with a small stagger.
 */
export function WordReveal({ text, className, wordClassName, delay = 0 }: WordRevealProps) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className={wordClassName}
            style={{ display: "inline-block", willChange: "transform" }}
            variants={{
              hidden: { y: "115%", opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            aria-hidden
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </motion.span>
  );
}

type FloatLoopProps = {
  children: ReactNode;
  className?: string;
  /** Vertical travel of the idle float, in px. */
  amount?: number;
  /** Full cycle duration in seconds. */
  duration?: number;
  /** Start delay so multiple floats desync. */
  delay?: number;
};

/**
 * Gentle, continuous idle float — the "breathing" motion that keeps
 * hero elements feeling alive even when the user isn't interacting.
 */
export function FloatLoop({
  children,
  className,
  amount = 10,
  duration = 6,
  delay = 0,
}: FloatLoopProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [-amount / 2, amount / 2, -amount / 2] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
