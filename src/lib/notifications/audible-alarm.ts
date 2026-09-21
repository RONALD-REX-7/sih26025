/**
 * SIH26025 Industrial Audible Alarm Synthesizer
 * 
 * Generates restrained, authentic industrial warning tones using Web Audio API oscillators.
 * Complies with browser autoplay policy: does not play until user has interacted with the document.
 * Provides explicit mute/unmute control and auto-silence upon alert acknowledgement.
 */

export class AudibleAlarm {
  private static instance: AudibleAlarm | null = null;
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private isMuted = false;
  private isAlarmPlaying = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMute = localStorage.getItem('sih26025_alarm_muted');
        if (savedMute !== null) {
          this.isMuted = savedMute === 'true';
        }
      } catch {
        // Fallback gracefully if storage access is restricted
      }
    }
  }

  public static getInstance(): AudibleAlarm {
    if (!AudibleAlarm.instance) {
      AudibleAlarm.instance = new AudibleAlarm();
    }
    return AudibleAlarm.instance;
  }

  private initAudioContext(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return !!this.audioCtx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sih26025_alarm_muted', String(muted));
      } catch {
        // Fallback gracefully if storage access is restricted
      }
    }
    if (muted) {
      this.stopAlarm();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }

  /**
   * Triggers an industrial acoustic pulse.
   * toneType: 'warning' (intermittent chime) | 'critical' (dual-tone urgent siren)
   */
  public triggerAlarm(toneType: 'warning' | 'critical' = 'warning'): void {
    if (this.isMuted) return;
    if (this.isAlarmPlaying) return;

    const initialized = this.initAudioContext();
    if (!initialized || !this.audioCtx) return;

    try {
      this.isAlarmPlaying = true;
      const ctx = this.audioCtx;

      this.gainNode = ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.08, ctx.currentTime); // Restrained volume
      this.gainNode.connect(ctx.destination);

      let isHighPitch = false;
      const primaryFreq = toneType === 'critical' ? 880 : 660;
      const secondaryFreq = toneType === 'critical' ? 988 : 554;

      this.oscillator = ctx.createOscillator();
      this.oscillator.type = 'triangle'; // Soft industrial triangle wave (cleaner than harsh square wave)
      this.oscillator.frequency.setValueAtTime(primaryFreq, ctx.currentTime);
      this.oscillator.connect(this.gainNode);
      this.oscillator.start();

      // Pulsing frequency warble
      this.intervalId = setInterval(() => {
        if (!this.oscillator || !this.gainNode || !this.audioCtx) return;
        isHighPitch = !isHighPitch;
        const targetFreq = isHighPitch ? secondaryFreq : primaryFreq;
        this.oscillator.frequency.setValueAtTime(targetFreq, this.audioCtx.currentTime);
      }, toneType === 'critical' ? 350 : 600);
    } catch {
      this.stopAlarm();
    }
  }

  /**
   * Silences active alarm.
   */
  public stopAlarm(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {}
      this.oscillator = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
    this.isAlarmPlaying = false;
  }

  /**
   * Single preview beep for audio testing by operator.
   */
  public playTestChime(): void {
    const initialized = this.initAudioContext();
    if (!initialized || !this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }
}
