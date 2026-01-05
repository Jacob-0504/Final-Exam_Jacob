/**
 * Simple Web Audio API implementation for UI sound effects.
 * Creates a short "click" sound using an oscillator.
 */
class AudioEffectService {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext lazily to comply with browser policies
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
  }

  public playClick() {
    if (!this.audioContext) return;

    // Resume context if suspended (common browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime); // High pitch click
    oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime); // Low volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }
}

export const audioEffects = new AudioEffectService();