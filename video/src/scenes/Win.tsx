import { Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Confetti, Doodle } from "../components/Doodles";
import { PopText } from "../components/PopText";
import { Sfx } from "../components/Sfx";
import { Chip, Stage, StepBadge } from "../components/Stage";
import { C, FONT, blockShadow } from "../theme";
import { scene, voAt } from "../timeline";

const { voDelay } = scene("win");

// Podium order left→right: 2nd, 1st, 3rd (same winners as the landing page).
const PODIUM = [
  { place: 2, avatar: "img/avatar-2.jpg", handle: "@elena_glow", amount: 0.09, height: 290, fill: "#e3e8f0", at: voDelay + 20 },
  { place: 1, avatar: "img/avatar-1.jpg", handle: "@maya_beachlife", amount: 0.16, height: 370, fill: C.yellow, at: voDelay + 30 },
  { place: 3, avatar: "img/avatar-3.jpg", handle: "@kiran_vibe", amount: 0.05, height: 240, fill: "#ffd6b8", at: voDelay + 12 },
];
const COL_W = 330;
const BASE_Y = 1080;
const CROWN_AT = voDelay + 52;
const PAID_AT = voAt("win", 0.62);
const COIN_SFX = [0, 9, 19, 31, 46, 64].map((d) => CROWN_AT + 6 + d);

const Crown: React.FC = () => (
  <svg viewBox="0 0 100 60" width={150} height={90}>
    <path d="M6 54 L10 16 L32 36 L50 8 L68 36 L90 16 L94 54 Z" fill={C.yellow} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={50} cy={8} r={7} fill={C.vote} stroke={C.ink} strokeWidth={4} />
  </svg>
);

export const Win: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const crown = spring({ frame: frame - CROWN_AT, fps, config: { damping: 7, stiffness: 160 } });
  const paid = spring({ frame: frame - PAID_AT, fps, config: { damping: 8, stiffness: 200 } });
  const podiumLeft = (1920 - COL_W * 3) / 2;

  return (
    <Stage bg={C.green} dot="rgba(0,109,50,0.18)">
      {/* Coin rain behind the podium once the winner is crowned. */}
      {Array.from({ length: 26 }).map((_, i) => {
        const start = CROWN_AT + i * 3;
        const age = frame - start;
        if (age < 0) return null;
        const x = random(`cx${i}`) * 1840;
        const y = -140 + age * (14 + random(`cv${i}`) * 8);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${age * 6 * (i % 2 ? 1 : -1)}deg)` }}>
            <Doodle name="coin" size={70 + random(`cs${i}`) * 50} />
          </div>
        );
      })}

      <StepBadge n={4} bg={C.ink} color={C.green} />
      <div style={{ position: "absolute", top: 70, width: "100%" }}>
        <PopText
          text="Winners take the pool!"
          delay={voDelay}
          stagger={6}
          size={92}
          color={C.ink}
          highlights={{ pool: { bg: C.blue, color: C.white } }}
        />
      </div>

      {PODIUM.map((p, i) => {
        const rise = spring({ frame: frame - p.at, fps, config: { damping: 12, stiffness: 120 } });
        const pop = spring({ frame: frame - p.at - 10, fps, config: { damping: 8, stiffness: 200 } });
        const left = podiumLeft + i * COL_W;
        const top = BASE_Y - p.height;
        const counter = interpolate(frame, [PAID_AT, PAID_AT + 30], [0, p.amount], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={p.place} style={{ position: "absolute", left, top, width: COL_W, transform: `translateY(${interpolate(rise, [0, 1], [p.height + 400, 0])}px)` }}>
            {/* avatar */}
            <div style={{ position: "absolute", left: COL_W / 2 - 85, top: -200, transform: `scale(${pop})` }}>
              <Img
                src={staticFile(p.avatar)}
                style={{ width: 170, height: 170, borderRadius: 999, objectFit: "cover", border: `8px solid ${C.ink}`, boxShadow: blockShadow(C.ink, 8) }}
              />
              {p.place === 1 ? (
                <div
                  style={{
                    position: "absolute",
                    left: 10,
                    top: -80,
                    opacity: frame < CROWN_AT ? 0 : 1,
                    transform: `translateY(${interpolate(crown, [0, 1], [-500, 0])}px) rotate(${interpolate(crown, [0, 1], [-30, -6])}deg)`,
                  }}
                >
                  <Crown />
                </div>
              ) : null}
            </div>
            {/* block */}
            <div
              style={{
                height: p.height + 40,
                background: p.fill,
                border: `6px solid ${C.ink}`,
                borderRadius: "24px 24px 0 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 24,
                gap: 14,
                fontFamily: FONT.sans,
              }}
            >
              <div style={{ fontFamily: FONT.pixel, fontSize: 56, color: C.ink }}>{p.place}</div>
              <div style={{ fontWeight: 800, fontSize: 28, color: C.ink }}>{p.handle}</div>
              {frame >= PAID_AT ? (
                <div style={{ fontWeight: 800, fontSize: 34, color: C.greenDeep, background: C.white, padding: "4px 16px", borderRadius: 12, border: `4px solid ${C.ink}` }}>
                  +{counter.toFixed(2)} BNB
                </div>
              ) : null}
            </div>
            <Sfx name="sfx/bottle" at={p.at + 4} volume={0.45} rate={0.8 + i * 0.15} />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          right: 80,
          top: 330,
          opacity: frame < PAID_AT ? 0 : 1,
          transform: `scale(${paid}) rotate(${interpolate(paid, [0, 1], [30, 6])}deg)`,
        }}
      >
        <Chip bg={C.bnb} style={{ fontSize: 40, flexDirection: "column", borderRadius: 28, gap: 0, padding: "18px 32px" }}>
          <span>⚡ Paid instantly</span>
          <span>on BNB Chain</span>
        </Chip>
      </div>

      <Confetti at={CROWN_AT + 6} x={960} y={560} count={90} seed="win" spread={1100} />
      <Sfx name="synth/powerup" at={CROWN_AT} volume={0.55} />
      <Sfx name="sfx/hero" at={CROWN_AT + 6} volume={0.45} />
      {COIN_SFX.map((t, i) => (
        <Sfx key={t} name="synth/coin" at={t} volume={0.3} rate={1 + (i % 3) * 0.08} />
      ))}
      <Sfx name="sfx/glass" at={PAID_AT} volume={0.5} />
    </Stage>
  );
};
