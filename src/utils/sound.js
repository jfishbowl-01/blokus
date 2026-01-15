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

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(130, now + 0.06);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(700, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  osc.start(now);
  osc.stop(now + 0.09);
}
