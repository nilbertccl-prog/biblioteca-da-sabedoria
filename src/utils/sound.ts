// Synthesized chime using Web Audio API (zero external network dependencies)
export function playChime(type: 'success' | 'bell' | 'tick' = 'bell') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
      setTimeout(() => ctx.close(), 100);
      return;
    }

    if (type === 'success') {
      // Pleasant chord arpeggio for book completion / goal reached
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.65);
      });
      setTimeout(() => ctx.close(), 1200);
      return;
    }

    // Classic meditative singing bowl / chime for Pomodoro end
    const fundamental = 528; // 528Hz healing tone
    const partials = [
      { f: fundamental, g: 0.18, d: 2.2 },
      { f: fundamental * 1.5, g: 0.08, d: 1.8 },
      { f: fundamental * 2.05, g: 0.04, d: 1.2 },
      { f: fundamental * 2.75, g: 0.02, d: 0.8 },
    ];

    partials.forEach(({ f, g, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(g, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + d);
    });

    setTimeout(() => ctx.close(), 2500);
  } catch {
    // AudioContext might be restricted until user gesture, safely ignored
  }
}
