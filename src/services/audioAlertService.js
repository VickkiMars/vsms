/**
 * audioAlertService.js
 * ────────────────────
 * Native Web Audio API sound synthesizer for facility overstay and security alerts.
 * Zero external asset dependencies (no MP3/WAV files required).
 * Resilient against browser autoplay policies with auto-unlocking user gesture listeners.
 */

class AudioAlertService {
  constructor() {
    this.audioCtx = null;
    this.muted = typeof window !== 'undefined' ? localStorage.getItem('vsms_audio_muted') === 'true' : false;
    this.lastAlertTimestamps = new Map(); // visitorId -> timestamp
    this.acknowledgedAlerts = new Set();  // visitorIds acknowledged by desk officer
    this.isUnlocked = false;

    if (typeof window !== 'undefined') {
      this._bindUnlockListeners();
    }
  }

  /**
   * Lazy initialization of the Web Audio Context.
   */
  _getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Bind one-time interaction listeners to unlock AudioContext on modern browsers.
   */
  _bindUnlockListeners() {
    const unlock = () => {
      const ctx = this._getAudioContext();
      if (ctx && ctx.state !== 'suspended') {
        this.isUnlocked = true;
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      }
    };
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  /**
   * Check if sound is currently muted.
   */
  isMuted() {
    return this.muted;
  }

  /**
   * Toggle mute state and persist to localStorage.
   */
  toggleMute() {
    this.muted = !this.muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vsms_audio_muted', this.muted ? 'true' : 'false');
    }
    return this.muted;
  }

  /**
   * Explicitly set mute state.
   */
  setMuted(value) {
    this.muted = Boolean(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vsms_audio_muted', this.muted ? 'true' : 'false');
    }
  }

  /**
   * Synthesize a clean, high-contrast two-tone overstay chime (880Hz -> 587.33Hz).
   */
  playOverstayChime(volume = 0.3) {
    if (this.muted) return;
    try {
      const ctx = this._getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.0001, now);
      // Gentle fade in
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.04);
      // Exponential decay
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      gainNode.connect(ctx.destination);

      // Tone 1: High harmonic ping (880 Hz / A5)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.4); // glides to E5
      osc1.connect(gainNode);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Tone 2: Resolve bell chime (587.33 Hz / D5) starting at +0.22s
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.0001, now + 0.22);
      gain2.gain.linearRampToValueAtTime(volume * 0.9, now + 0.26);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      gain2.connect(ctx.destination);

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(587.33, now + 0.22);
      osc2.connect(gain2);
      osc2.start(now + 0.22);
      osc2.stop(now + 1.4);
    } catch (e) {
      console.warn('Web Audio synthesis bypassed:', e);
    }
  }

  /**
   * Synthesize an urgent security alert alarm (pulse tone).
   */
  playSecurityWarningAlarm(volume = 0.35) {
    if (this.muted) return;
    try {
      const ctx = this._getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      [0, 0.18, 0.36].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(980, now + offset);
        osc.frequency.linearRampToValueAtTime(740, now + offset + 0.12);

        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.linearRampToValueAtTime(volume, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    } catch (e) {
      console.warn('Security alarm audio bypassed:', e);
    }
  }

  /**
   * Check if an alert can be played for a visitor (prevents continuous chime spam).
   * Default cooldown: 60,000ms (1 minute) per visitor unless unacknowledged or acknowledged.
   */
  canAlertVisitor(visitorId, cooldownMs = 60000) {
    if (this.muted) return false;
    if (this.acknowledgedAlerts.has(visitorId)) return false;
    const last = this.lastAlertTimestamps.get(visitorId) || 0;
    return (Date.now() - last) > cooldownMs;
  }

  /**
   * Record that an audible alert was fired for this visitor.
   */
  recordAlert(visitorId) {
    this.lastAlertTimestamps.set(visitorId, Date.now());
  }

  /**
   * Desk officer acknowledges the overstay, silencing further repetitive sounds for this visitor.
   */
  acknowledgeAlert(visitorId) {
    this.acknowledgedAlerts.add(visitorId);
  }

  /**
   * Reset acknowledgment (e.g. if visitor stay is extended or check-out occurs).
   */
  clearAcknowledgment(visitorId) {
    this.acknowledgedAlerts.delete(visitorId);
    this.lastAlertTimestamps.delete(visitorId);
  }
}

export const audioAlertService = new AudioAlertService();
