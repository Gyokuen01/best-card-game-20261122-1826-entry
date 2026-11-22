// Tiny synthesized sound effects (WebAudio oscillators, no audio files, no network).
// Everything is a no-op until the first user gesture creates an AudioContext.
let ctx = null;
let muted = false;

export function setMuted(value) { muted = value; }
export function isMuted() { return muted; }

function ensure() {
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type, vol, delay) {
  const ac = ensure();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + (delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol || 0.12, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch { /* sound is decoration; never break the game */ }
}

export const sfx = {
  click() { tone(660, 0.06, 'triangle', 0.08); },
  play() { tone(520, 0.09, 'triangle', 0.12); tone(780, 0.12, 'triangle', 0.1, 0.06); },
  attack() { tone(140, 0.16, 'sawtooth', 0.14); tone(90, 0.2, 'square', 0.08, 0.02); },
  heal() { tone(620, 0.14, 'sine', 0.1); tone(930, 0.18, 'sine', 0.08, 0.08); },
  shield() { tone(440, 0.12, 'sine', 0.1); tone(554, 0.14, 'sine', 0.08, 0.05); },
  turn() { tone(880, 0.07, 'triangle', 0.07); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, i * 0.11)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.26, 'sine', 0.11, i * 0.13)); },
};
