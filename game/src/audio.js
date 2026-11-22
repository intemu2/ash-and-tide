// Tiny WebAudio bleeps. No audio files, no network. Everything is guarded:
// if audio is unavailable the game plays silently instead of crashing.
let context = null;

function getContext() {
  if (context) return context;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
    return context;
  } catch {
    return null;
  }
}

/** One short sine blip at `freq` Hz for `seconds`. Never throws. */
export function blip(freq, seconds = 0.12, volume = 0.05) {
  try {
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  } catch {
    // Silence is fine.
  }
}

export function playSound(kind) {
  if (kind === 'play') blip(520, 0.1);
  else if (kind === 'win-trick') {
    blip(660, 0.1);
    setTimeout(() => blip(880, 0.14), 90);
  } else if (kind === 'lose-trick') blip(220, 0.16);
  else if (kind === 'win-game') {
    blip(523, 0.12);
    setTimeout(() => blip(659, 0.12), 110);
    setTimeout(() => blip(784, 0.2), 220);
  } else if (kind === 'lose-game') blip(180, 0.3);
}
