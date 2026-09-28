import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Polaroid } from "../components/Brand";
import { DoodleField } from "../components/Doodles";
import { PopText } from "../components/PopText";
import { Sfx } from "../components/Sfx";
import { Stage } from "../components/Stage";
import { C } from "../theme";
import { scene } from "../timeline";

const { voDelay } = scene("hook");

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const flashAt = voDelay + 2;
  const flash = interpolate(frame, [flashAt, flashAt + 2, flashAt + 10], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Stage bg={C.blue} dot="rgba(255,255,255,0.16)">
      <Polaroid src="img/snap-1.jpg" caption="#SummerVibes" x={90} y={90} rotate={-9} delay={2} from={[-700, -300]} width={380} />
      <Polaroid src="img/snap-3.jpg" caption="#CityLife" x={1440} y={120} rotate={8} delay={8} from={[700, -300]} width={360} />
      <Polaroid src="img/snap-5.jpg" caption="#CampusVibes" x={1400} y={600} rotate={-6} delay={14} from={[700, 400]} width={380} />
      <Polaroid src="img/snap-2.jpg" x={120} y={640} rotate={7} delay={20} from={[-700, 400]} width={330} />

      <DoodleField items={[{ name: "star", x: 560, y: 120, size: 90, delay: 30 }, { name: "bolt", x: 1260, y: 860, size: 90, delay: 36 }]} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
        <PopText text="Snap now." delay={voDelay} stagger={7} size={180} />
        <PopText
          text="Win the moment."
          delay={voDelay + 26}
          stagger={6}
          size={150}
          highlights={{ moment: { bg: C.yellow, color: C.ink } }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ background: C.white, opacity: flash }} />
      <Sfx name="synth/whoosh" at={2} volume={0.35} />
      <Sfx name="synth/whoosh" at={12} volume={0.3} rate={1.2} />
      <Sfx name="synth/shutter" at={flashAt} volume={0.7} />
    </Stage>
  );
};
