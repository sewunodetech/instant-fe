#!/usr/bin/env bash
# Builds every local asset the Remotion video needs (macOS only):
#   1. Voiceover lines spoken by the built-in `say` voice
#   2. Sound effects copied from /System/Library/Sounds
#   3. Chiptune SFX + background loop from scripts/synth.mjs
#   4. Brand/mock images copied from the Next.js app's /public
# and writes src/audio-manifest.json with each voiceover's duration so the
# scenes can size themselves around the narration.
#
# Override the narrator with: VOICE="Flo (English (US))" RATE=185 npm run assets
set -euo pipefail

cd "$(dirname "$0")/.."
VOICE="${VOICE:-Samantha}"
RATE="${RATE:-185}"
APP_PUBLIC="../public"
OUT="public"

command -v say >/dev/null || { echo "This script needs macOS 'say'."; exit 1; }
command -v ffmpeg >/dev/null || { echo "Install ffmpeg first: brew install ffmpeg"; exit 1; }

mkdir -p "$OUT/audio/vo" "$OUT/audio/sfx" "$OUT/img"

# ---------------------------------------------------------------- voiceover
# id|text — ids match the scene ids in src/timeline.ts.
LINES=(
  "intro|Hey! Welcome to instant dot fun!"
  "hook|Snap now. Win the moment."
  "join|Step one. Join a live campaign, like Summer Vibes, or City Life. It's free to enter!"
  "snap|Step two. Snap a real moment in a two minute window. Live camera only. No filters. No fakes."
  "vote|Step three. The community votes for their favorite snaps. Votes are free, and the gas is on us."
  "win|Step four. Winners take the prize pool, paid out instantly on B.N.B. Chain."
  "outro|Instant dot fun. Snap. Join. Get voted!"
)

echo "🎙  Voiceover ($VOICE @ ${RATE}wpm)"
manifest="{"
for entry in "${LINES[@]}"; do
  id="${entry%%|*}"
  text="${entry#*|}"
  tmp="$(mktemp -t vo).aiff"
  say -v "$VOICE" -r "$RATE" -o "$tmp" "$text"
  # Light polish: trim leading silence, gentle compression, normalize loudness.
  ffmpeg -loglevel error -y -i "$tmp" \
    -af "silenceremove=start_periods=1:start_threshold=-50dB,acompressor=threshold=-18dB:ratio=3,loudnorm=I=-16:TP=-1.5" \
    -ar 44100 -ac 1 "$OUT/audio/vo/$id.wav"
  rm -f "$tmp"
  dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/audio/vo/$id.wav")"
  echo "  vo → $id.wav (${dur}s)"
  manifest+="\"$id\":$dur,"
done
manifest="${manifest%,}}"
echo "$manifest" > src/audio-manifest.json

# ------------------------------------------------------------ system sounds
echo "🔔 macOS system sounds"
for s in Pop Tink Glass Hero Funk Bottle Frog Purr Morse; do
  ffmpeg -loglevel error -y -i "/System/Library/Sounds/$s.aiff" -ar 44100 "$OUT/audio/sfx/$(echo "$s" | tr '[:upper:]' '[:lower:]').wav"
  echo "  sfx → $s"
done

# ------------------------------------------------------------- chiptune
echo "🎹 Chiptune SFX + music"
node scripts/synth.mjs "$OUT/audio/synth"

# ----------------------------------------------------------------- images
echo "🖼  Images"
cp "$APP_PUBLIC/brand/logo.png" "$OUT/img/logo.png"
cp "$APP_PUBLIC/marketing/hero.jpg" "$OUT/img/hero.jpg"
cp "$APP_PUBLIC"/mock/campaigns/{summer-vibes,city-life,best-friends}.jpg "$OUT/img/"
for f in snap-1 snap-2 snap-3 snap-4 snap-5 snap-6 avatar-1 avatar-2 avatar-3; do
  cp "$APP_PUBLIC/mock/leaderboard/$f.jpg" "$OUT/img/$f.jpg"
done
cp "$APP_PUBLIC/mock/snap-summer-cafe.jpg" "$OUT/img/snap-cafe.jpg"

echo "✅ Assets ready."
