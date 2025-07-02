
import { useRef, useCallback } from 'react';

// Nintendo Switch-style sound effects with lower, more pleasant frequencies
const SOUND_EFFECTS = {
  click: { frequency: 311, duration: 100, volume: 0.12, type: 'sine' }, // Based on cancel
  softClick: { frequency: 261, duration: 80, volume: 0.08, type: 'sine' }, // Lower variation
  select: { frequency: 349, duration: 90, volume: 0.10, type: 'sine' }, // F note
  success: { frequency: 392, duration: 180, volume: 0.14, type: 'sine' }, // G note
  achievement: { frequency: 440, duration: 250, volume: 0.16, type: 'sine' }, // A note
  startActivity: { frequency: 369, duration: 200, volume: 0.14, type: 'sine' }, // F# note
  navigation: { frequency: 293, duration: 90, volume: 0.10, type: 'sine' }, // D note
  goal: { frequency: 415, duration: 300, volume: 0.15, type: 'sine' }, // G# note
  pop: { frequency: 466, duration: 60, volume: 0.12, type: 'sine' }, // A# note
  swoosh: { frequency: 246, duration: 120, volume: 0.08, type: 'sine' }, // B note
  confirm: { frequency: 329, duration: 120, volume: 0.12, type: 'sine' }, // E note
  cancel: { frequency: 311, duration: 100, volume: 0.10, type: 'sine' }, // Eb note (original)
  error: { frequency: 220, duration: 150, volume: 0.12, type: 'sine' }, // A note (lower for error)
};

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSoundsRef = useRef<Set<OscillatorNode>>(new Set());
  const lastSoundTimeRef = useRef<number>(0);

  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
    
    return audioContextRef.current;
  }, []);

  const cleanupSound = useCallback((oscillator: OscillatorNode) => {
    activeSoundsRef.current.delete(oscillator);
  }, []);

  const playSound = useCallback(async (soundType: keyof typeof SOUND_EFFECTS) => {
    try {
      const now = Date.now();
      
      // Throttle sounds to prevent overwhelming the system (max 10 sounds per second)
      if (now - lastSoundTimeRef.current < 100) {
        return;
      }
      lastSoundTimeRef.current = now;

      // Limit concurrent sounds to prevent audio system overload
      if (activeSoundsRef.current.size >= 3) {
        // Clean up oldest sounds
        const oldestSounds = Array.from(activeSoundsRef.current).slice(0, 2);
        oldestSounds.forEach(sound => {
          try {
            sound.stop();
          } catch (e) {
            // Sound may already be stopped
          }
          activeSoundsRef.current.delete(sound);
        });
      }

      const audioContext = await initAudioContext();
      const sound = SOUND_EFFECTS[soundType];
      
      // Create oscillator for the tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Track active sound
      activeSoundsRef.current.add(oscillator);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure sound with smooth sine wave for pleasant tones
      oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
      oscillator.type = sound.type as OscillatorType;
      
      // Configure volume envelope for smooth, pleasant sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(sound.volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + sound.duration / 1000);
      
      // Clean up when sound ends
      oscillator.addEventListener('ended', () => {
        cleanupSound(oscillator);
      });
      
      // Play sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sound.duration / 1000);
      
    } catch (error) {
      // Silently fail if audio context is not available
      console.warn('Audio playback failed:', error);
    }
  }, [initAudioContext, cleanupSound]);

  const playClick = useCallback(() => playSound('click'), [playSound]);
  const playSoftClick = useCallback(() => playSound('softClick'), [playSound]);
  const playSelect = useCallback(() => playSound('select'), [playSound]);
  const playSuccess = useCallback(() => playSound('success'), [playSound]);
  const playAchievement = useCallback(() => playSound('achievement'), [playSound]);
  const playStartActivity = useCallback(() => playSound('startActivity'), [playSound]);
  const playNavigation = useCallback(() => playSound('navigation'), [playSound]);
  const playGoal = useCallback(() => playSound('goal'), [playSound]);
  const playPop = useCallback(() => playSound('pop'), [playSound]);
  const playSwoosh = useCallback(() => playSound('swoosh'), [playSound]);
  const playConfirm = useCallback(() => playSound('confirm'), [playSound]);
  const playCancel = useCallback(() => playSound('cancel'), [playSound]);
  const playError = useCallback(() => playSound('error'), [playSound]);

  return {
    playClick,
    playSoftClick,
    playSelect,
    playSuccess,
    playAchievement,
    playStartActivity,
    playNavigation,
    playGoal,
    playPop,
    playSwoosh,
    playConfirm,
    playCancel,
    playError,
  };
};
