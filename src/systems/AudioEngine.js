export class AudioEngine {
  constructor() {
    this.context = null;
    this.started = false;
    this.musicGain = null;
    this.musicOsc = null;
    this.musicStep = 0;
  }

  ensureContext() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.context = new AudioContextClass();
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = 0.05;
      this.musicGain.connect(this.context.destination);
    }
    return this.context;
  }

  startBackgroundLoop() {
    const ctx = this.ensureContext();
    if (!ctx || this.started) return;
    this.started = true;

    const frequencies = [110, 164.81, 220, 196, 146.83, 174.61];
    const schedule = () => {
      if (!this.started) return;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequencies[this.musicStep % frequencies.length], ctx.currentTime);
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.012, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gainNode);
      gainNode.connect(this.musicGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      this.musicStep += 1;
      setTimeout(schedule, 210);
    };

    schedule();
  }

  playTone(frequency, duration = 0.12, type = 'square', gainValue = 0.05) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gainNode.gain.value = 0.0001;
    gainNode.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
}
