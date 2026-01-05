/**
 * MusicSynthesizer
 * A generative music engine using Web Audio API.
 * Creates beats and melodies in real-time based on genre.
 */
class MusicSynthesizer {
    private audioContext: AudioContext | null = null;
    private isPlaying: boolean = false;
    private nextNoteTime: number = 0;
    private timerID: number | null = null;
    private currentGenre: string = 'K-Pop';
    private tempo: number = 120;
    private beatCount: number = 0;
  
    constructor() {
      if (typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioContext = new AudioContextClass();
        }
      }
    }
  
    private getTempoForGenre(genre: string): number {
      switch (genre) {
        case 'Speedcore': return 180;
        case 'Drum&Bass': return 170;
        case 'Rock': return 140;
        case 'K-Pop': return 125;
        case 'Dubstep': return 140;
        case 'Lo-Fi': return 80;
        default: return 120;
      }
    }
  
    // Schedule notes slightly ahead of time
    private scheduler() {
      if (!this.audioContext) return;
  
      // lookahead: 0.1s
      while (this.nextNoteTime < this.audioContext.currentTime + 0.1) {
        this.playBeat(this.nextNoteTime);
        this.playMelody(this.nextNoteTime);
        this.scheduleNextBeat();
      }
      
      if (this.isPlaying) {
        this.timerID = window.setTimeout(() => this.scheduler(), 25);
      }
    }
  
    private scheduleNextBeat() {
      const secondsPerBeat = 60.0 / this.tempo;
      // We schedule 16th notes (4 notes per beat) for better resolution
      this.nextNoteTime += 0.25 * secondsPerBeat; 
      this.beatCount++;
    }
  
    // Drum Synthesis
    private playBeat(time: number) {
      if (!this.audioContext) return;
  
      // 16-step pattern index
      const step = this.beatCount % 16;
      
      // Basic Kick (On 0, 4, 8, 12 for 4/4)
      const isKick = (step % 4 === 0);
      // Basic Snare (On 4, 12)
      const isSnare = (step % 8 === 4);
      // Hi-hat (Every 2 steps usually)
      const isHihat = (step % 2 === 0);
  
      if (this.currentGenre === 'Speedcore' || this.currentGenre === 'Drum&Bass') {
        // Complex beat for fast genres
        if (step % 4 === 0 || step === 14) this.playKick(time);
        if (step === 4 || step === 12) this.playSnare(time);
        if (step % 1 === 0) this.playHiHat(time); // Fast hats
      } else if (this.currentGenre === 'Rock') {
         if (step === 0 || step === 10) this.playKick(time);
         if (step === 4 || step === 12) this.playSnare(time);
         if (step % 2 === 0) this.playHiHat(time);
      } else if (this.currentGenre === 'Lo-Fi') {
         // Swing feel? Just simple for now
         if (step === 0 || step === 9) this.playKick(time);
         if (step === 4 || step === 12) this.playSnare(time);
         if (step % 4 === 0) this.playHiHat(time);
      } else {
        // Standard K-Pop / Pop
        if (isKick) this.playKick(time);
        if (isSnare) this.playSnare(time);
        if (isHihat) this.playHiHat(time);
      }
    }
  
    private playKick(time: number) {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start(time);
      osc.stop(time + 0.5);
    }
  
    private playSnare(time: number) {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.type = 'triangle'; // Simpler snare
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start(time);
      osc.stop(time + 0.2);
    }
  
    private playHiHat(time: number) {
      // Simulate noise with high freq square
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(8000, time);
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      osc.start(time);
      osc.stop(time + 0.05);
    }
  
    // Melody Synthesis (Random Pentatonic)
    private playMelody(time: number) {
        if (!this.audioContext) return;
        
        // Play only on certain steps to leave space
        const step = this.beatCount % 16;
        if (step % 2 !== 0 && this.currentGenre !== 'Speedcore') return; // Sparse melody
  
        // Pentatonic Scale (C Majorish)
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; 
        const noteIndex = Math.floor(Math.random() * scale.length);
        const freq = scale[noteIndex];
  
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = this.currentGenre === 'Lo-Fi' ? 'sine' : 'sawtooth';
        
        // Filter for Lo-Fi
        if (this.currentGenre === 'Lo-Fi') {
           // softer sound
        }
  
        osc.frequency.setValueAtTime(freq, time);
        
        const volume = this.currentGenre === 'Lo-Fi' ? 0.1 : 0.05;
        const duration = this.currentGenre === 'Speedcore' ? 0.1 : 0.2;
  
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + duration);
    }
  
    public play(genre: string) {
      if (!this.audioContext) return;
      
      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
  
      this.currentGenre = genre;
      this.tempo = this.getTempoForGenre(genre);
      this.isPlaying = true;
      this.nextNoteTime = this.audioContext.currentTime;
      this.beatCount = 0;
      
      if (this.timerID) clearTimeout(this.timerID);
      this.scheduler();
    }
  
    public stop() {
      this.isPlaying = false;
      if (this.timerID) {
        clearTimeout(this.timerID);
        this.timerID = null;
      }
    }
  
    public updateGenre(genre: string) {
        this.currentGenre = genre;
        this.tempo = this.getTempoForGenre(genre);
    }
  }
  
  export const musicSynth = new MusicSynthesizer();