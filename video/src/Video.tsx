import { TransitionSeries, springTiming, type TransitionPresentation } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import { Sfx } from "./components/Sfx";
import { Hook } from "./scenes/Hook";
import { Intro } from "./scenes/Intro";
import { Join } from "./scenes/Join";
import { Outro } from "./scenes/Outro";
import { Snap } from "./scenes/Snap";
import { Vote } from "./scenes/Vote";
import { Win } from "./scenes/Win";
import { HEIGHT, SCENES, TOTAL_FRAMES, TRANSITION, VO_RANGES, WIDTH, type SceneId } from "./timeline";

const COMPONENTS: Record<SceneId, React.FC> = {
  intro: Intro,
  hook: Hook,
  join: Join,
  snap: Snap,
  vote: Vote,
  win: Win,
  outro: Outro,
};

/** One playful transition per cut (index i = cut into scene i + 1). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANSITIONS: TransitionPresentation<any>[] = [
  slide({ direction: "from-right" }),
  iris({ width: WIDTH, height: HEIGHT }),
  wipe({ direction: "from-top-left" }),
  slide({ direction: "from-bottom" }),
  clockWipe({ width: WIDTH, height: HEIGHT }),
  iris({ width: WIDTH, height: HEIGHT }),
];

const timing = springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION });

/** Music level: ducks under the narrator, fades in/out at the ends. */
const musicVolume = (f: number) => {
  const speaking = VO_RANGES.some(([a, b]) => f >= a - 6 && f <= b + 6);
  const nearest = Math.min(...VO_RANGES.map(([a, b]) => (f < a ? a - f : f > b ? f - b : 0)));
  const duck = speaking ? 0.09 : interpolate(nearest, [6, 20], [0.09, 0.22], { extrapolateRight: "clamp" });
  const fade = interpolate(f, [0, 20, TOTAL_FRAMES - 50, TOTAL_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return duck * fade;
};

export const InstantFunDemo: React.FC = () => (
  <AbsoluteFill style={{ background: "#fcf9f8" }}>
    <TransitionSeries>
      {SCENES.flatMap((s, i) => {
        const Scene = COMPONENTS[s.id];
        const seq = (
          <TransitionSeries.Sequence key={s.id} durationInFrames={s.duration} name={s.id}>
            <Scene />
            <Sequence from={s.voDelay} layout="none" name={`vo ${s.id}`}>
              <Html5Audio src={staticFile(`audio/vo/${s.id}.wav`)} volume={1} />
            </Sequence>
          </TransitionSeries.Sequence>
        );
        return i < SCENES.length - 1
          ? [seq, <TransitionSeries.Transition key={`t${i}`} presentation={TRANSITIONS[i]} timing={timing} />]
          : [seq];
      })}
    </TransitionSeries>

    {/* Whoosh on every cut. */}
    {SCENES.slice(1).map((s) => (
      <Sfx key={s.id} name="synth/whoosh" at={s.start - 2} volume={0.45} />
    ))}

    <Html5Audio src={staticFile("audio/synth/music-loop.wav")} loop volume={musicVolume} />
  </AbsoluteFill>
);
