let audioContext = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playPlacementSound() {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') {
    context.resume();
  }

  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}
