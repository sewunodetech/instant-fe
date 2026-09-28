import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { DoodleField } from "../components/Doodles";
import { PopText } from "../components/PopText";
import { Sfx } from "../components/Sfx";
import { Chip, Stage, StepBadge } from "../components/Stage";
import { C, FONT, blockShadow } from "../theme";
import { scene, voAt } from "../timeline";

const { voDelay } = scene("snap");
const TIMER_START = 12;
const SHUTTER_AT = voAt("snap", 0.52);
const RULES = [
  { label: "✅ Live camera only", bg: C.green, at: voAt("snap", 0.6) },
  { label: "🚫 No filters", bg: C.white, at: voAt("snap", 0.78) },
  { label: "🤖 No fakes", bg: C.white, at: voAt("snap", 0.9) },
];

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 110 } });
  const snapped = frame >= SHUTTER_AT;

  // 2:00 countdown that freezes once the photo is taken.
  const elapsed = Math.max(0, Math.floor((Math.min(frame, SHUTTER_AT) - TIMER_START) / 30));
  const left = 120 - elapsed;
  const timer = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  const press = spring({ frame: frame - SHUTTER_AT, fps, config: { damping: 8, stiffness: 300 } });
  const buttonScale = snapped ? 1 - Math.sin(Math.min(1, press) * Math.PI) * 0.25 : 1 + Math.sin(frame / 6) * 0.04;
  const flash = interpolate(frame, [SHUTTER_AT, SHUTTER_AT + 2, SHUTTER_AT + 14], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sticker = spring({ frame: frame - SHUTTER_AT - 10, fps, config: { damping: 7, stiffness: 180 } });
  const zoom = snapped ? 1.05 : 1.15 - (frame / 400) * 0.1;

  return (
    <div
      style={{
        position: "absolute",
        right: 220,
        top: 70,
        width: 500,
        height: 940,
        borderRadius: 72,
        background: C.ink,
        padding: 18,
        boxShadow: `${blockShadow("rgba(0,0,0,0.5)", 20)}, 0 0 0 6px ${C.yellow}`,
        transform: `translateY(${interpolate(enter, [0, 1], [1100, 0])}px) rotate(${interpolate(enter, [0, 1], [18, 4])}deg)`,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 56, overflow: "hidden" }}>
        <Img
          src={staticFile("img/snap-cafe.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }}
        />
        {/* viewfinder corners */}
        {[
          { top: 150, left: 40, borderWidth: "8px 0 0 8px" },
          { top: 150, right: 40, borderWidth: "8px 8px 0 0" },
          { bottom: 220, left: 40, borderWidth: "0 0 8px 8px" },
          { bottom: 220, right: 40, borderWidth: "0 8px 8px 0" },
        ].map((pos, i) => (
          <div key={i} style={{ position: "absolute", width: 70, height: 70, borderStyle: "solid", borderColor: C.white, ...pos }} />
        ))}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            padding: "0 30px",
            fontFamily: FONT.pixel,
            fontSize: 26,
          }}
        >
          <span style={{ background: C.vote, color: C.white, padding: "10px 14px", borderRadius: 12 }}>
            {frame % 30 < 20 ? "●" : "○"} LIVE
          </span>
          <span style={{ background: C.yellow, color: C.ink, padding: "10px 14px", borderRadius: 12 }}>{timer}</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: "50%",
            width: 130,
            height: 130,
            marginLeft: -65,
            borderRadius: 999,
            background: C.white,
            border: `12px solid ${C.blue}`,
            boxShadow: "0 8px 24px rgba(40,120,255,0.5)",
            transform: `scale(${buttonScale})`,
          }}
        />
        <AbsoluteFill style={{ background: C.white, opacity: flash }} />
        {snapped ? (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                transform: `scale(${sticker}) rotate(${interpolate(sticker, [0, 1], [-40, -8])}deg)`,
                background: C.yellow,
                border: `6px solid ${C.ink}`,
                borderRadius: 24,
                padding: "18px 32px",
                fontFamily: FONT.sans,
                fontWeight: 800,
                fontSize: 64,
                color: C.ink,
                boxShadow: blockShadow(C.ink, 10),
              }}
            >
              Snapped! ✨
            </div>
          </AbsoluteFill>
        ) : null}
      </div>
    </div>
  );
};

export const Snap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ticks = Array.from({ length: Math.max(0, Math.floor((SHUTTER_AT - TIMER_START) / 30)) }, (_, i) => TIMER_START + (i + 1) * 30);

  return (
    <Stage bg={C.ink} dot="rgba(255,255,255,0.08)">
      <StepBadge n={2} bg={C.yellow} color={C.ink} />
      <DoodleField
        delay={8}
        items={[
          { name: "camera", x: 900, y: 90, size: 110, rotate: -10 },
          { name: "star", x: 1780, y: 880, size: 90, rotate: 10 },
          { name: "bolt", x: 820, y: 860, size: 90, rotate: -8 },
        ]}
      />

      <div style={{ position: "absolute", left: 100, top: 250, width: 900 }}>
        <PopText text="Snap it" delay={voDelay} stagger={6} size={150} align="left" />
        <PopText
          text="LIVE in 2 min!"
          delay={voDelay + 16}
          stagger={6}
          size={130}
          align="left"
          highlights={{ LIVE: { bg: C.vote, color: C.white } }}
        />
      </div>

      <div style={{ position: "absolute", left: 100, top: 690, display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start" }}>
        {RULES.map((r, i) => {
          const s = spring({ frame: frame - r.at, fps, config: { damping: 8, stiffness: 220 } });
          return (
            <div
              key={r.label}
              style={{
                opacity: frame < r.at ? 0 : 1,
                transform: `translateX(${interpolate(s, [0, 1], [-300, 0])}px) scale(${s}) rotate(${i % 2 ? 2 : -2}deg)`,
              }}
            >
              <Chip bg={r.bg} style={{ fontSize: 44 }}>
                {r.label}
              </Chip>
              <Sfx name={i === 0 ? "sfx/tink" : "sfx/funk"} at={r.at} volume={0.5} />
            </div>
          );
        })}
      </div>

      <Phone />

      {ticks.map((t) => (
        <Sfx key={t} name="synth/tick" at={t} volume={0.25} />
      ))}
      <Sfx name="synth/whoosh" at={2} volume={0.3} rate={0.8} />
      <Sfx name="synth/shutter" at={SHUTTER_AT} volume={0.9} />
      <Sfx name="sfx/pop" at={SHUTTER_AT + 12} volume={0.6} />
    </Stage>
  );
};
