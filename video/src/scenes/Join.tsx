import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Confetti, DoodleField } from "../components/Doodles";
import { PopText } from "../components/PopText";
import { Sfx } from "../components/Sfx";
import { Chip, Stage, StepBadge } from "../components/Stage";
import { C, FONT, blockShadow } from "../theme";
import { scene, voAt } from "../timeline";

/** Same campaigns as components/landing/content.ts. */
const CAMPAIGNS = [
  { tag: "#SummerVibes", image: "img/summer-vibes.jpg", pool: "0.5 BNB", creators: "1.2k creators", left: "5 days left" },
  { tag: "#CityLife", image: "img/city-life.jpg", pool: "0.3 BNB", creators: "843 creators", left: "3 days left" },
  { tag: "#CampusVibes", image: "img/best-friends.jpg", pool: "0.6 BNB", creators: "1.4k creators", left: "7 days left" },
];

const { voDelay } = scene("join");
const CARD_AT = [voDelay + 22, voDelay + 32, voDelay + 42];
// Cards "jump" as the narrator names them.
const SPOTLIGHT = [voAt("join", 0.47), voAt("join", 0.62), -1];
const FREE_AT = voAt("join", 0.8);

const CampaignCard: React.FC<{ c: (typeof CAMPAIGNS)[number]; i: number }> = ({ c, i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - CARD_AT[i], fps, config: { damping: 11, stiffness: 120 } });
  const jump = SPOTLIGHT[i] > 0 ? spring({ frame: frame - SPOTLIGHT[i], fps, config: { damping: 6, stiffness: 200 } }) : 0;
  const jumpY = SPOTLIGHT[i] > 0 && frame >= SPOTLIGHT[i] ? -Math.sin(Math.min(1, (frame - SPOTLIGHT[i]) / 14) * Math.PI) * 70 : 0;
  const bob = Math.sin((frame + i * 20) / 22) * 8;
  const rest = [-4, 2, 5][i];
  const livePulse = 0.6 + 0.4 * Math.abs(Math.sin(frame / 8));

  return (
    <div
      style={{
        width: 500,
        background: C.white,
        border: `6px solid ${C.ink}`,
        borderRadius: 32,
        overflow: "hidden",
        boxShadow: blockShadow(C.ink, 16),
        transform: `translateY(${interpolate(enter, [0, 1], [900, 0]) + bob + jumpY}px) rotate(${interpolate(enter, [0, 1], [rest * 6, rest])}deg) scale(${1 + jump * 0.06})`,
      }}
    >
      <div style={{ position: "relative", height: 290 }}>
        <Img src={staticFile(c.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 18px",
            borderRadius: 999,
            background: C.vote,
            color: C.white,
            fontFamily: FONT.pixel,
            fontSize: 20,
            border: `4px solid ${C.ink}`,
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: 99, background: C.white, opacity: livePulse }} />
          LIVE
        </div>
      </div>
      <div style={{ padding: "22px 28px 28px", fontFamily: FONT.sans }}>
        <div style={{ fontSize: 50, fontWeight: 800, color: C.ink, letterSpacing: "-0.02em" }}>{c.tag}</div>
        <div style={{ display: "flex", gap: 14, marginTop: 16, alignItems: "center" }}>
          <span
            style={{
              background: C.bnb,
              color: C.ink,
              fontWeight: 800,
              fontSize: 28,
              padding: "8px 18px",
              borderRadius: 14,
              border: `4px solid ${C.ink}`,
            }}
          >
            🏆 {c.pool}
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: C.inkSoft }}>{c.creators}</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.blue, marginTop: 12 }}>⏱ {c.left}</div>
      </div>
      <Sfx name="synth/whoosh" at={CARD_AT[i]} volume={0.3} rate={0.9 + i * 0.15} />
      {SPOTLIGHT[i] > 0 ? <Sfx name="sfx/bottle" at={SPOTLIGHT[i]} volume={0.5} /> : null}
    </div>
  );
};

export const Join: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const free = spring({ frame: frame - FREE_AT, fps, config: { damping: 8, stiffness: 200 } });

  return (
    <Stage bg={C.surface}>
      <StepBadge n={1} />
      <DoodleField
        delay={10}
        items={[
          { name: "star", x: 1700, y: 60, size: 100, rotate: 10 },
          { name: "heart", x: 70, y: 470, size: 80, rotate: -10 },
          { name: "coin", x: 1780, y: 520, size: 80, rotate: 12 },
        ]}
      />

      <div style={{ position: "absolute", top: 70, width: "100%" }}>
        <PopText
          text="Join a live campaign"
          delay={voDelay}
          stagger={6}
          size={104}
          color={C.ink}
          highlights={{ live: { bg: C.green, color: C.ink } }}
        />
      </div>

      <AbsoluteFill style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 60, top: 150 }}>
        {CAMPAIGNS.map((c, i) => (
          <CampaignCard key={c.tag} c={c} i={i} />
        ))}
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          right: 110,
          bottom: 60,
          transform: `scale(${interpolate(free, [0, 1], [3, 1])}) rotate(${interpolate(free, [0, 1], [30, -6])}deg)`,
          opacity: frame < FREE_AT ? 0 : Math.min(1, free * 3),
        }}
      >
        <Chip bg={C.yellow} style={{ fontSize: 54, padding: "20px 40px" }}>
          🎟 Free to enter!
        </Chip>
      </div>
      <Confetti at={FREE_AT + 4} x={1560} y={960} count={40} seed="join" spread={600} />
      <Sfx name="sfx/glass" at={FREE_AT} volume={0.5} />
      <Sfx name="sfx/pop" at={FREE_AT + 4} volume={0.6} />
    </Stage>
  );
};
