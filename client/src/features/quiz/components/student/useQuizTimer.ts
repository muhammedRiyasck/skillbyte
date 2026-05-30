import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

// --- Audio Utility for Timer Sounds ---
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
};

const playBeep = (freq: number, duration: number, vol: number) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
    toast.error("Failed to play timer sound")
  }
};

interface UseQuizTimerOptions {
  /** ISO date string of when the attempt was started (from server) */
  startedAt: string;
  /** Time limit in minutes, or null for unlimited */
  timeLimitMinutes: number | null;
}

interface UseQuizTimerResult {
  /** Remaining seconds, or null if no time limit */
  timeRemaining: number | null;
  /** True once timeRemaining reaches 0 */
  isExpired: boolean;
  /** True when ≤ 5 minutes remain */
  isWarning: boolean;
  /** True when ≤ 1 minute remains */
  isCritical: boolean;
  /** Formatted MM:SS string, or null if no time limit */
  formattedTime: string | null;
}

export function useQuizTimer({
  startedAt,
  timeLimitMinutes,
}: UseQuizTimerOptions): UseQuizTimerResult {
  const computeRemaining = (): number | null => {
    if (timeLimitMinutes === null) return null;
    const startMs = new Date(startedAt).getTime();
    const limitMs = timeLimitMinutes * 60 * 1000;
    const elapsed = Date.now() - startMs;
    return Math.max(0, Math.floor((limitMs - elapsed) / 1000));
  };

  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    computeRemaining
  );

  // Use a ref so the interval always reads the latest value
  const timeLimitRef = useRef(timeLimitMinutes);
  timeLimitRef.current = timeLimitMinutes;

  useEffect(() => {
    if (timeLimitMinutes === null) {
      setTimeRemaining(null);
      return;
    }

    // Set correct value immediately on mount (handles page refresh)
    setTimeRemaining(computeRemaining());

    const interval = setInterval(() => {
      const remaining = computeRemaining();

      setTimeRemaining((prevRemaining) => {
        // Only trigger sounds exactly when the second changes
        if (prevRemaining !== remaining && remaining !== null) {
          if (remaining === 300) {
            // Warning chime at exactly 5 minutes remaining
            playBeep(440, 0.5, 0.4);
          } else if (remaining === 60) {
            // Chime at exactly 1 minute remaining
            playBeep(523.25, 0.4, 0.5);
            setTimeout(() => playBeep(659.25, 0.6, 0.5), 150);
          } else if (remaining <= 10 && remaining > 0) {
            // Ticking for the last 10 seconds (louder)
            playBeep(880, 0.1, 0.3);
          } else if (remaining === 0 && prevRemaining !== 0) {
            // Long beep when time expires
            playBeep(440, 1.2, 0.6);
          }
        }
        return remaining;
      });

      if (remaining !== null && remaining <= 0) {
        clearInterval(interval);
      }
    }, 250); // check 4 times a second to accurately catch the second boundary

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, timeLimitMinutes]);

  const isExpired = timeRemaining !== null && timeRemaining <= 0;
  const isWarning = timeRemaining !== null && timeRemaining <= 300 && !isExpired; // ≤ 5 min
  const isCritical = timeRemaining !== null && timeRemaining <= 60 && !isExpired; // ≤ 1 min

  const formattedTime: string | null =
    timeRemaining === null
      ? null
      : (() => {
        const totalSec = Math.max(0, timeRemaining);
        const minutes = Math.floor(totalSec / 60);
        const seconds = totalSec % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      })();

  return { timeRemaining, isExpired, isWarning, isCritical, formattedTime };
}
