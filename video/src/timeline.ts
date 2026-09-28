import manifest from "./audio-manifest.json";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Frames each scene overlaps the next one during a transition. */
export const TRANSITION = 14;

export type SceneId = keyof typeof manifest;

type SceneSpec = {
  id: SceneId;
  /** Frames into the scene before the narrator starts. */
  voDelay: number;
  /** Frames the scene holds after the narration ends. */
  tail: number;
};

const SPECS: SceneSpec[] = [
  { id: "intro", voDelay: 24, tail: 24 },
  { id: "hook", voDelay: 16, tail: 30 },
  { id: "join", voDelay: 16, tail: 24 },
  { id: "snap", voDelay: 16, tail: 30 },
  { id: "vote", voDelay: 16, tail: 30 },
  { id: "win", voDelay: 16, tail: 40 },
  { id: "outro", voDelay: 16, tail: 75 },
];

export type Scene = SceneSpec & {
  duration: number;
  /** Absolute frame the scene starts at (transitions included). */
  start: number;
  voFrames: number;
};

/** Scene durations are derived from the voiceover lengths in the manifest. */
export const SCENES: Scene[] = (() => {
  let cursor = 0;
  return SPECS.map((spec) => {
    const voFrames = Math.ceil(manifest[spec.id] * FPS);
    const duration = spec.voDelay + voFrames + spec.tail;
    const scene = { ...spec, duration, voFrames, start: cursor };
    cursor += duration - TRANSITION;
    return scene;
  });
})();

export const scene = (id: SceneId) => SCENES.find((s) => s.id === id)!;

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.duration, 0) - TRANSITION * (SCENES.length - 1);

/** Absolute [start, end] frame ranges where the narrator is speaking. */
export const VO_RANGES = SCENES.map((s) => [s.start + s.voDelay, s.start + s.voDelay + s.voFrames] as const);

/**
 * Frame (relative to the scene) at `fraction` of the way through its
 * narration — a cheap way to land visuals on the right word.
 */
export const voAt = (id: SceneId, fraction: number) => {
  const s = scene(id);
  return Math.round(s.voDelay + s.voFrames * fraction);
};
