import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../components/Brand";
import { Confetti, DoodleField } from "../components/Doodles";
import { PopText } from "../components/PopText";
import { Sfx } from "../components/Sfx";
import { Stage } from "../components/Stage";
import { C, FONT, blockShadow } from "../theme";
import { scene, voAt } from "../timeline";

const { voDelay } = scene("outro");
const TAG_AT = voAt("outro", 0.42);
const CTA_AT = voAt("outro", 1) + 6;

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cta = spring({ frame: frame - CTA_AT, fps, config: { damping: 9, stiffness: 170 } });
  const shine = ((frame - CTA_AT) % 50) / 50;

  return (
    <Stage bg={C.yellow}>
      <DoodleField
        delay={6}
        items={[
          { name: "star", x: 120, y: 110, size: 120, rotate: -12 },
          { name: "heart", x: 1640, y: 120, size: 110, rotate: 10 },
          { name: "camera", x: 150, y: 800, size: 120, rotate: 8 },
          { name: "coin", x: 1650, y: 780, size: 120, rotate: -8 },
          { name: "ghost", x: 900, y: 930, size: 80 },
        ]}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40, top: -30 }}>
        <Logo delay={voDelay - 6} size={180} dot={C.blue} crownFill={C.white} />
        <PopText
          text="Snap. Join. Get Voted."
          delay={TAG_AT}
          stagger={9}
          size={96}
          color={C.ink}
          sfxVolume={0.5}
          highlights={{
            Snap: { bg: C.blue, color: C.white },
            Join: { bg: C.green, color: C.ink },
            Voted: { bg: C.vote, color: C.white },
          }}
        />
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: 20,
            opacity: frame < CTA_AT ? 0 : 1,
            transform: `scale(${cta}) translateY(${interpolate(cta, [0, 1], [80, 0])}px)`,
            background: C.ink,
            color: C.white,
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 48,
            padding: "26px 56px",
            borderRadius: 999,
            boxShadow: blockShadow(C.blueDeep, 10),
          }}
        >
          Launch the app at <span style={{ color: C.yellow }}>instant.fun</span> →
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 120,
              left: `${interpolate(shine, [0, 1], [-20, 120])}%`,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
        </div>
      </AbsoluteFill>

      <Confetti at={CTA_AT} x={960} y={700} count={100} seed="outro" spread={1300} />
      <Sfx name="sfx/hero" at={CTA_AT} volume={0.5} />
      <Sfx name="synth/coin" at={CTA_AT + 4} volume={0.4} />
    </Stage>
  );
};
