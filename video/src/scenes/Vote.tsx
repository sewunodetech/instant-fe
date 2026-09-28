import { Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Doodle } from "../components/Doodles";
import { PopText } from "../components/PopText";
import { Sfx } from "../components/Sfx";
import { Chip, Stage, StepBadge } from "../components/Stage";
import { C, FONT, blockShadow } from "../theme";
import { scene, voAt } from "../timeline";

const { voDelay } = scene("vote");

const SNAPS = [
  { src: "img/snap-1.jpg", handle: "@maya_beachlife", votes: 284 },
  { src: "img/snap-4.jpg", handle: "@elena_glow", votes: 241 },
  { src: "img/snap-6.jpg", handle: "@kiran_vibe", votes: 173 },
  { src: "img/snap-3.jpg", handle: "@jo.snaps", votes: 129 },
];
const CARD_W = 380;
const GAP = 44;
const ROW_LEFT = (1920 - (CARD_W * 4 + GAP * 3)) / 2;
const CARD_TOP = 330;
const CARD_AT = SNAPS.map((_, i) => voDelay + 18 + i * 6);

// Taps rain on the cards while the narrator talks about voting.
const TAPS = [0.3, 0.4, 0.48, 0.56, 0.63, 0.7, 0.78, 0.86].map((f, i) => ({
  at: voAt("vote", f),
  card: [0, 1, 0, 2, 0, 3, 1, 0][i],
}));
const GAS_AT = voAt("vote", 0.72);

const votesFor = (card: number, frame: number) =>
  SNAPS[card].votes + TAPS.filter((t) => t.card === card && frame >= t.at).length * (card === 0 ? 7 : 3);

export const Vote: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gas = spring({ frame: frame - GAS_AT, fps, config: { damping: 8, stiffness: 200 } });

  return (
    <Stage bg={C.vote} dot="rgba(255,255,255,0.18)">
      <StepBadge n={3} bg={C.white} color={C.vote} />

      <div style={{ position: "absolute", top: 70, width: "100%" }}>
        <PopText
          text="Tap to vote ❤"
          delay={voDelay}
          stagger={7}
          size={120}
          highlights={{ vote: { bg: C.yellow, color: C.ink } }}
        />
      </div>

      {SNAPS.map((s, i) => {
        const enter = spring({ frame: frame - CARD_AT[i], fps, config: { damping: 10, stiffness: 150 } });
        const lastTap = [...TAPS].reverse().find((t) => t.card === i && frame >= t.at);
        const squash = lastTap ? spring({ frame: frame - lastTap.at, fps, config: { damping: 6, stiffness: 400 } }) : 1;
        const tapScale = lastTap ? interpolate(squash, [0, 1], [0.9, 1]) : 1;
        const leader = i === 0 && frame > TAPS[4].at;
        return (
          <div
            key={s.src}
            style={{
              position: "absolute",
              left: ROW_LEFT + i * (CARD_W + GAP),
              top: CARD_TOP,
              width: CARD_W,
              background: C.white,
              borderRadius: 30,
              border: `6px solid ${C.ink}`,
              boxShadow: blockShadow(C.ink, 14),
              overflow: "hidden",
              transform: `translateY(${interpolate(enter, [0, 1], [800, 0]) + Math.sin((frame + i * 15) / 20) * 6}px) scale(${enter * tapScale}) rotate(${[-3, 2, -2, 3][i]}deg)`,
            }}
          >
            <Img src={staticFile(s.src)} style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", fontFamily: FONT.sans }}>
              <span style={{ fontWeight: 800, fontSize: 22, color: C.ink }}>{s.handle}</span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: leader ? C.vote : C.voteSoft,
                  color: leader ? C.white : C.vote,
                  fontWeight: 800,
                  fontSize: 26,
                  whiteSpace: "nowrap",
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                ♥ {votesFor(i, frame)}
              </span>
            </div>
            {leader ? (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontFamily: FONT.pixel,
                  fontSize: 20,
                  background: C.yellow,
                  color: C.ink,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `4px solid ${C.ink}`,
                }}
              >
                #1
              </div>
            ) : null}
            <Sfx name="sfx/pop" at={CARD_AT[i]} volume={0.35} rate={1 + i * 0.12} />
          </div>
        );
      })}

      {/* Tap ripples + hearts floating up from the tapped card. */}
      {TAPS.map((t, i) => {
        const age = frame - t.at;
        if (age < 0 || age > 45) return null;
        const cx = ROW_LEFT + t.card * (CARD_W + GAP) + CARD_W / 2 + (random(`tx${i}`) - 0.5) * 140;
        const cy = CARD_TOP + 230 + (random(`ty${i}`) - 0.5) * 120;
        const ripple = interpolate(age, [0, 16], [0.2, 1.6], { extrapolateRight: "clamp" });
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: cx - 60,
                top: cy - 60,
                width: 120,
                height: 120,
                borderRadius: 999,
                border: `8px solid ${C.white}`,
                transform: `scale(${ripple})`,
                opacity: interpolate(age, [0, 16], [1, 0], { extrapolateRight: "clamp" }),
              }}
            />
            <div
              style={{
                position: "absolute",
                left: cx - 55,
                top: cy - 55 - age * 9,
                transform: `scale(${spring({ frame: age, fps, config: { damping: 7 } }) * 1.3}) rotate(${Math.sin(age / 4) * 14}deg)`,
                opacity: interpolate(age, [25, 45], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              <Doodle
                name="heart"
                size={110}
                style={{
                  filter:
                    "drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff) drop-shadow(0 4px 0 #fff) drop-shadow(0 -4px 0 #fff)",
                }}
              />
            </div>
            <Sfx name="sfx/pop" at={t.at} volume={0.45} rate={1.1 + (i % 4) * 0.12} />
            <Sfx name="synth/blip" at={t.at + 2} volume={0.18} rate={1 + i * 0.05} />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          bottom: 50,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: frame < GAS_AT ? 0 : 1,
          transform: `scale(${gas}) rotate(${interpolate(gas, [0, 1], [-20, -2])}deg)`,
        }}
      >
        <Chip bg={C.green} style={{ fontSize: 50, padding: "18px 40px" }}>
          ⛽ $0 gas · sponsored
        </Chip>
      </div>
      <Sfx name="synth/coin" at={GAS_AT} volume={0.5} />
    </Stage>
  );
};
