import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../components/Brand";
import { DoodleField } from "../components/Doodles";
import { Sfx } from "../components/Sfx";
import { Chip, Stage } from "../components/Stage";
import { C, FONT } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chipAt = 58;
  const chip = spring({ frame: frame - chipAt, fps, config: { damping: 9, stiffness: 180 } });
  const blink = Math.floor(frame / 12) % 2 === 0;

  return (
    <Stage bg={C.yellow}>
      <DoodleField
        delay={4}
        items={[
          { name: "star", x: 140, y: 120, size: 120, rotate: -12 },
          { name: "camera", x: 1600, y: 140, size: 130, rotate: 10 },
          { name: "heart", x: 230, y: 760, size: 110, rotate: 8 },
          { name: "coin", x: 1580, y: 720, size: 120, rotate: -8 },
          { name: "ghost", x: 820, y: 60, size: 80, rotate: 6 },
          { name: "controller", x: 1060, y: 880, size: 100, rotate: -10 },
          { name: "bolt", x: 560, y: 860, size: 90, rotate: 14 },
        ]}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 70 }}>
        <Logo delay={6} size={210} dot={C.blue} crownFill={C.white} />
        <div style={{ transform: `scale(${chip}) rotate(${interpolate(chip, [0, 1], [-25, -3])}deg)` }}>
          <Chip bg={C.ink} color={C.yellow} style={{ fontSize: 52, padding: "20px 40px" }}>
            Snap. Join. Get Voted.
          </Chip>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 60,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT.pixel,
          fontSize: 26,
          color: C.ink,
          opacity: frame > 40 && blink ? 1 : 0,
        }}
      >
        PRESS ▶ START
      </div>

      <Sfx name="sfx/funk" at={chipAt} volume={0.4} />
    </Stage>
  );
};
