import { Html5Audio, Sequence, staticFile } from "remotion";

export type SfxName =
  // macOS system sounds (/System/Library/Sounds)
  | "sfx/pop"
  | "sfx/tink"
  | "sfx/glass"
  | "sfx/hero"
  | "sfx/funk"
  | "sfx/bottle"
  | "sfx/frog"
  | "sfx/purr"
  | "sfx/morse"
  // chiptune synth (scripts/synth.mjs)
  | "synth/coin"
  | "synth/shutter"
  | "synth/whoosh"
  | "synth/blip"
  | "synth/powerup"
  | "synth/tick";

/** Plays a one-shot sound effect at `at` frames into the current sequence. */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number; rate?: number }> = ({
  name,
  at,
  volume = 0.6,
  rate = 1,
}) => (
  <Sequence from={Math.round(at)} layout="none" name={`sfx ${name}`}>
    <Html5Audio src={staticFile(`audio/${name}.wav`)} volume={volume} playbackRate={rate} />
  </Sequence>
);
