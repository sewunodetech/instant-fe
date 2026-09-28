/**
 * Tiny dependency-free chiptune synth. Renders the retro sound effects and
 * the looping background track to 16-bit mono WAV files, so the video's
 * audio matches the pixel-art look of the landing page.
 *
 * Usage: node scripts/synth.mjs <outDir>
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const outDir = process.argv[2] ?? "public/audio/synth";
mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------- helpers

const buf = (seconds) => new Float32Array(Math.ceil(seconds * SR));
const noteHz = (midi) => 440 * 2 ** ((midi - 69) / 12);

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** "E5" → midi number. */
const midi = (name) => NOTE[name[0]] + 12 * (Number(name.slice(1)) + 1);

const osc = {
  square: (phase, duty = 0.5) => (phase % 1 < duty ? 1 : -1),
  triangle: (phase) => 4 * Math.abs((phase % 1) - 0.5) - 1,
  sine: (phase) => Math.sin(2 * Math.PI * phase),
};

let seed = 1234567;
const noise = () => {
  // Deterministic LCG so every render sounds identical.
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return (seed / 0x7fffffff) * 2 - 1;
};

/** Adds a tone into `out` starting at `start` seconds. */
function tone(out, { start, dur, freq, freqEnd = freq, wave = "square", duty = 0.5, vol = 0.3, attack = 0.004, release = 0.05 }) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  let phase = 0;
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    const t = i / SR;
    const f = freq + (freqEnd - freq) * (i / n);
    phase += f / SR;
    const env = Math.min(1, t / attack) * Math.min(1, (dur - t) / release);
    out[s0 + i] += osc[wave](phase, duty) * vol * Math.max(0, env);
  }
}

/** Adds a burst of noise, optionally high-passed and with a decay curve. */
function burst(out, { start, dur, vol = 0.3, decay = 20, highpass = false }) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  let prev = 0;
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    const t = i / SR;
    let v = noise();
    if (highpass) {
      const hp = v - prev;
      prev = v;
      v = hp * 0.6;
    }
    out[s0 + i] += v * vol * Math.exp(-t * decay);
  }
}

function normalize(data, peak = 0.9) {
  let max = 0;
  for (const v of data) max = Math.max(max, Math.abs(v));
  if (max > 0) for (let i = 0; i < data.length; i++) data[i] *= peak / max;
  return data;
}

function writeWav(name, data) {
  const bytes = Buffer.alloc(44 + data.length * 2);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(36 + data.length * 2, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20); // PCM
  bytes.writeUInt16LE(1, 22); // mono
  bytes.writeUInt32LE(SR, 24);
  bytes.writeUInt32LE(SR * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(data.length * 2, 40);
  for (let i = 0; i < data.length; i++) {
    const v = Math.max(-1, Math.min(1, data[i]));
    bytes.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  writeFileSync(join(outDir, name), bytes);
  console.log(`  synth → ${name} (${(data.length / SR).toFixed(2)}s)`);
}

// ------------------------------------------------------------ sound effects

// Classic two-note coin pickup.
{
  const out = buf(0.45);
  tone(out, { start: 0, dur: 0.07, freq: noteHz(83), duty: 0.5, vol: 0.35 });
  tone(out, { start: 0.07, dur: 0.38, freq: noteHz(88), duty: 0.5, vol: 0.35, release: 0.3 });
  writeWav("coin.wav", normalize(out, 0.7));
}

// Camera shutter: a sharp click, then the curtain snapping back.
{
  const out = buf(0.25);
  burst(out, { start: 0, dur: 0.04, vol: 0.9, decay: 90, highpass: true });
  tone(out, { start: 0, dur: 0.02, freq: 2200, freqEnd: 800, wave: "square", vol: 0.25, release: 0.01 });
  burst(out, { start: 0.08, dur: 0.06, vol: 0.7, decay: 60, highpass: true });
  writeWav("shutter.wav", normalize(out, 0.85));
}

// Whoosh: noise through a sweeping one-pole low-pass with a swell envelope.
{
  const dur = 0.5;
  const out = buf(dur);
  let lp = 0;
  for (let i = 0; i < out.length; i++) {
    const p = i / out.length;
    const cutoff = 0.02 + 0.25 * Math.sin(Math.PI * p);
    lp += cutoff * (noise() - lp);
    out[i] = lp * Math.sin(Math.PI * p) ** 2;
  }
  writeWav("whoosh.wav", normalize(out, 0.6));
}

// Short rising blip for small UI pops.
{
  const out = buf(0.09);
  tone(out, { start: 0, dur: 0.09, freq: 600, freqEnd: 1400, duty: 0.25, vol: 0.4, release: 0.04 });
  writeWav("blip.wav", normalize(out, 0.55));
}

// Power-up arpeggio for the win moment.
{
  const out = buf(0.9);
  ["C5", "E5", "G5", "C6", "E6", "G6"].forEach((n, i) =>
    tone(out, { start: i * 0.06, dur: 0.12, freq: noteHz(midi(n)), duty: 0.25, vol: 0.3 }),
  );
  tone(out, { start: 0.36, dur: 0.5, freq: noteHz(midi("C7")), duty: 0.5, vol: 0.25, release: 0.4 });
  writeWav("powerup.wav", normalize(out, 0.7));
}

// Countdown tick.
{
  const out = buf(0.08);
  tone(out, { start: 0, dur: 0.06, freq: noteHz(midi("A5")), duty: 0.125, vol: 0.4, release: 0.03 });
  writeWav("tick.wav", normalize(out, 0.5));
}

// ---------------------------------------------------------- background loop
// 8 bars at 120 BPM (16s) in C major: C – G – Am – F, so it loops seamlessly.
{
  const BPM = 120;
  const step = 60 / BPM / 2; // eighth note
  const bars = 8;
  const out = buf(bars * 8 * step);

  const chords = [
    ["C3", "C4", "E4", "G4"],
    ["G2", "G3", "B3", "D4"],
    ["A2", "A3", "C4", "E4"],
    ["F2", "F3", "A3", "C4"],
  ];

  // Melody on an eighth-note grid, "-" holds / rests.
  const melody = [
    "E5 - G5 - A5 G5 E5 -", "D5 E5 - C5 - - - -",
    "D5 - G5 - B5 A5 G5 -", "A5 G5 - D5 - - - -",
    "C6 - B5 A5 - E5 - A5", "G5 - E5 - - - - -",
    "A5 - G5 F5 - A5 - C6", "D6 - C6 - B5 - G5 -",
  ].join(" ").split(" ");

  for (let bar = 0; bar < bars; bar++) {
    const chord = chords[Math.floor(bar / 2)];
    const barStart = bar * 8 * step;

    // Bass: root / octave bounce on quarter notes (triangle).
    for (let q = 0; q < 4; q++) {
      const root = midi(chord[0]) + (q % 2 ? 12 : 0);
      tone(out, { start: barStart + q * 2 * step, dur: step * 1.6, freq: noteHz(root), wave: "triangle", vol: 0.34 });
    }

    // Arpeggio: thin pulse wave on sixteenths.
    const arp = [chord[1], chord[2], chord[3], chord[2]];
    for (let s = 0; s < 16; s++) {
      tone(out, { start: barStart + s * (step / 2), dur: step / 2.2, freq: noteHz(midi(arp[s % 4]) + 12), duty: 0.125, vol: 0.06 });
    }

    // Drums: kick on 1 & 3, snare on 2 & 4, hats on eighths.
    for (let q = 0; q < 4; q++) {
      const t = barStart + q * 2 * step;
      if (q % 2 === 0) tone(out, { start: t, dur: 0.14, freq: 150, freqEnd: 40, wave: "sine", vol: 0.6, release: 0.08 });
      else burst(out, { start: t, dur: 0.12, vol: 0.22, decay: 30 });
    }
    for (let e = 0; e < 8; e++) burst(out, { start: barStart + e * step, dur: 0.03, vol: 0.08, decay: 120, highpass: true });
  }

  // Melody: each note rings until the next note (max 3 steps).
  melody.forEach((n, i) => {
    if (n === "-") return;
    let len = 1;
    while (len < 3 && melody[i + len] === "-") len++;
    tone(out, { start: i * step, dur: len * step * 0.92, freq: noteHz(midi(n)), duty: 0.5, vol: 0.13, release: 0.06 });
  });

  writeWav("music-loop.wav", normalize(out, 0.8));
}
