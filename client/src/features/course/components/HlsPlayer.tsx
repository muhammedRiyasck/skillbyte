import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';

// Expose videojs to window for plugins to work in Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).videojs = videojs;

import 'video.js/dist/video-js.css';

interface HlsPlayerProps {
  src: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: (duration: number) => void;
  initialTime?: number;
  onResumed?: () => void;
}

interface QualityOption {
  id: string;
  label: string;
}

// Interface for videojs-contrib-quality-levels plugin
interface VideoJsQualityLevel {
  id: string;
  width?: number;
  height?: number;
  bitrate: number;
  enabled: boolean;
}

interface VideoJsQualityLevelList {
  length: number;
  selectedIndex: number;
  [index: number]: VideoJsQualityLevel;
  on(type: string, listener: () => void): void;
  off(type: string, listener: () => void): void;
}

type PlayerWithQualityLevels = Player & {
  qualityLevels?: () => VideoJsQualityLevelList;
};

const HlsPlayer: React.FC<HlsPlayerProps> = ({
  src,
  onTimeUpdate,
  onEnded,
  initialTime = 0,
  onResumed,
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const initialSeekDone = useRef(false);
  const timeUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [currentQualityLabel, setCurrentQualityLabel] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(initialTime > 0);
  const [vjsContainer, setVjsContainer] = useState<HTMLElement | null>(null);
  const playbackRates = [0.5, 1, 1.5, 2];


  useEffect(() => {
    if (!videoRef.current) return;

    // Reset seek flag so the new src's initialTime is applied correctly.
    // Without this, switching to a new lesson with initialTime > 0 would be
    // skipped because the ref was still true from the previous lesson.
    initialSeekDone.current = false;

    // Create the video element dynamically
    const videoElement = document.createElement('video');
    videoElement.classList.add('video-js', 'vjs-big-play-centered', 'vjs-theme-city');
    videoElement.setAttribute('playsInline', 'true');
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: true,
      fluid: true,
      // Eagerly load metadata so we know duration / can resume before play
      preload: 'metadata',
      html5: {
        vhs: {
          // Start with the lowest rendition so first frames appear ASAP,
          // then ABR ramps up quality as bandwidth is measured.
          enableLowInitialPlaylist: true,

          // Only buffer 2 s ahead at the start so first segment loads fast.
          // VHS will grow this automatically once playback is stable.
          bufferGoal: 2,

          // Keep 60 s of already-played video in memory so seeking backward
          // is instant (no re-download).
          backBufferLength: 60,

          // Allow segments to redirect (needed for the 302 signed-URL trick).
          handlePartialData: true,

          // Disable the initial bandwidth guess – let VHS measure it live.
          useNetworkInformationApi: true,
          
          // Disable internal downscaling limit so it respects user selection even on small screens
          limitRenditionByPlayerDimensions: false,
          
          // Force immediate quality switch when manually selected
          smoothQualityChange: false,
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
      sources: [
        {
          src,
          type: 'application/x-mpegURL',
        },
      ],
      playbackRates
    });
    
    playerRef.current = player as Player;
    setVjsContainer(player.el() as HTMLElement);

    const updateQualities = () => {
      const p = player as PlayerWithQualityLevels;
      const qualityLevels = p.qualityLevels?.() 
      if (!qualityLevels) return;

      const availableQualities = Array.from({ length: qualityLevels.length }, (_, index) => {
        const quality = qualityLevels[index];
        return {
          id: quality.id,
          label: quality.height ? `${quality.height}p` : `${Math.round(quality.bitrate / 1000)} kbps`,
        };
      });

      setQualities(availableQualities);
    };

    const p = player as PlayerWithQualityLevels;
    const qualityLevels = p.qualityLevels?.();
    qualityLevels?.on('addqualitylevel', updateQualities);

    // Helper: find the VHS segment-metadata text track and ensure it's active.
    // VHS populates one cue per downloaded segment; each cue's time range spans
    // exactly the segment's position in the media timeline, so reading activeCues[0]
    // at the current playhead gives the resolution of the frame being DECODED NOW.
    const getSegmentMetadataTrack = (): TextTrack | null => {
      const tl = player.textTracks() as unknown as TextTrack[];
      for (let i = 0; i < tl.length; i++) {
        if (tl[i].label === 'segment-metadata') {
          // mode must be 'hidden' (not 'disabled') for activeCues to be populated.
          if (tl[i].mode === 'disabled') tl[i].mode = 'hidden';
          return tl[i];
        }
      }
      return null;
    };

    const readCurrentSegmentQuality = () => {
      const track = getSegmentMetadataTrack();
      if (!track || !track.activeCues || track.activeCues.length === 0) return;
      const cue = track.activeCues[0] as unknown as { value?: string | { resolution?: { height?: number }, bandwidth?: number } };
      if (!cue?.value) return;
      try {
        const data = typeof cue.value === 'string' ? JSON.parse(cue.value) : cue.value;
        const height = data?.resolution?.height;
        const bandwidth = data?.bandwidth;
        if (height) setCurrentQualityLabel(`${height}p`);
        else if (bandwidth) setCurrentQualityLabel(`${Math.round(bandwidth / 1000)} kbps`);
      } catch { /* ignore */ }
    };

    // Seed the label immediately when ABR decides a rendition (before first segment plays).
    const handleQualityChange = () => {
      if (!qualityLevels) return;
      const idx = qualityLevels.selectedIndex ?? -1;
      if (idx >= 0 && qualityLevels[idx]) {
        const ql = qualityLevels[idx];
        const label = ql.height ? `${ql.height}p` : `${Math.round(ql.bitrate / 1000)} kbps`;
        setCurrentQualityLabel(label);
      }
    };
    qualityLevels?.on('change', handleQualityChange);

    player.on('loadedmetadata', () => {
      updateQualities();
      if (initialTime > 0 && !initialSeekDone.current) {
        player.currentTime(initialTime);
        initialSeekDone.current = true;
        // Wait for the seek to finish before removing the initial loading state
        player.one('seeked', () => {
          setIsInitialLoading(false);
          if (onResumed) onResumed();
        });
      }
    });

    // Show a subtle seeking indicator so the user knows something is happening.
    player.on('seeking', () => setIsSeeking(true));
    player.on('seeked', () => setIsSeeking(false));
    player.on('waiting', () => setIsSeeking(true));
    player.on('playing', () => setIsSeeking(false));

    // Poll segment-metadata on every timeupdate (~4x/sec).
    // readCurrentSegmentQuality reads activeCues[0] at the CURRENT playhead position,
    // which is the cue for the segment being decoded right now – fully accurate.
    player.on('timeupdate', () => {
      readCurrentSegmentQuality();
      if (!onTimeUpdate) return;
      if (timeUpdateTimer.current) clearTimeout(timeUpdateTimer.current);
      timeUpdateTimer.current = setTimeout(() => {
        const currentTime = player.currentTime() || 0;
        const duration = player.duration() || 0;
        onTimeUpdate(currentTime, duration);
      }, 500);
    });

    player.on('ended', () => {
      if (timeUpdateTimer.current) clearTimeout(timeUpdateTimer.current);
      if (onEnded) {
        onEnded(player.duration() || 0);
      }
    });

    // --- Keyboard Shortcuts ---
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts if the user is typing in an input field (e.g. comments/notes)
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      
      const p = playerRef.current;
      if (!p) return;

      switch (e.key.toLowerCase()) {
        case ' ': // Space
        case 'k':
          e.preventDefault();
          if (p.paused()) p.play();
          else p.pause();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          p.currentTime(Math.max(0, (p.currentTime() || 0) - 10));
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          p.currentTime(Math.min(p.duration() || 0, (p.currentTime() || 0) + 10));
          break;
        case 'arrowup':
          e.preventDefault();
          p.volume(Math.min(1, (p.volume() || 0) + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          p.volume(Math.max(0, (p.volume() || 0) - 0.1));
          break;
        case 'm':
          e.preventDefault();
          p.muted(!p.muted());
          break;
        case 'f':
          e.preventDefault();
          if (p.isFullscreen()) p.exitFullscreen();
          else p.requestFullscreen();
          break;
        // shift + > to jump to next playback speed
        case '>': {
          e.preventDefault();
          const currentSpeed = p.playbackRate() || 1;
          const nextSpeed = playbackRates.find((speed) => speed > currentSpeed);
          if (nextSpeed) p.playbackRate(nextSpeed);
          break;
        }

        case '<': {
          e.preventDefault();
          const currentSpeed2 = p.playbackRate() || 2;
          const nextSpeed2 = [...playbackRates].reverse().find((speed) => speed < currentSpeed2);
          if (nextSpeed2) p.playbackRate(nextSpeed2);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeUpdateTimer.current) clearTimeout(timeUpdateTimer.current);
      qualityLevels?.off('addqualitylevel', updateQualities);
      qualityLevels?.off('change', handleQualityChange);
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]); // Re-initialize when src changes

  const selectQuality = (qualityId: string) => {
    const p = playerRef.current as PlayerWithQualityLevels | null;
    const qualityLevels = p?.qualityLevels?.();
    if (!qualityLevels) return;

    for (let index = 0; index < qualityLevels.length; index += 1) {
      qualityLevels[index].enabled =
        qualityId === 'auto' || qualityLevels[index].id === qualityId;
    }
    setSelectedQuality(qualityId);

    if (!playerRef.current) return;

    const currentTime = playerRef.current.currentTime() ?? 0;
    const duration = playerRef.current.duration() ?? 0;

    // ── 1. Evict back-buffer (already-played segments at old quality) ──────────
    // VHS keeps up to backBufferLength seconds of played segments in the
    // SourceBuffer. If we don't remove them, seeking backward will serve those
    // old low-quality frames instead of re-downloading at the new rendition.
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tech = (playerRef.current as any).tech(true);
      const vhs = tech?.vhs ?? tech?.hls; // 'hls' is the legacy alias
      const mediaSource = vhs?.mediaSource;
      if (mediaSource?.readyState === 'open') {
        const sourceBuffers: SourceBuffer[] = Array.from(mediaSource.sourceBuffers ?? []);
        const removeEnd = Math.max(0, currentTime - 0.1);
        sourceBuffers.forEach((sb) => {
          if (!sb.updating && removeEnd > 0) {
            try {
              sb.remove(0, removeEnd);
            } catch { /* ignore if out of range */ }
          }
        });
      }
    } catch { /* silently ignore if internal API unavailable */ }

    // ── 2. Flush forward buffer so VHS immediately fetches the new rendition ───
    // Seeking to the exact same time is a no-op in VHS when the buffer is
    // already filled, so we add a tiny epsilon to force a real seek.
    const seekTarget = Math.min(currentTime + 0.001, duration);
    playerRef.current.currentTime(seekTarget);
  };

  return (
    <div data-vjs-player className="relative w-full aspect-video">
      {/* Hide the default Video.js big play button while we are in initial load */}
      <style>{`
        ${isInitialLoading ? '.vjs-big-play-button { display: none !important; }' : ''}
        @keyframes hls-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Video.js container - we append the actual video element here dynamically */}
      <div ref={videoRef} className="w-full h-full" />

      {/* Render overlays directly into the video.js container so they persist in fullscreen */}
      {vjsContainer ? createPortal(
        <>
          {/* Seeking / buffering / initial loading spinner */}
          {(isSeeking || isInitialLoading) && (
            <div 
              className={`pointer-events-none absolute inset-0 z-[100] flex items-center justify-center ${
                isInitialLoading ? 'bg-black' : 'bg-black/40'
              }`}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  border: '4px solid rgba(255,255,255,0.25)',
                  borderTop: '4px solid #fff',
                  borderRadius: '50%',
                  animation: 'hls-spin 0.7s linear infinite',
                }}
              />
            </div>
          )}
          
          {qualities.length > 0 && (
            <div className="absolute right-4 top-4 z-[100] flex items-center gap-3">
              {/* Live quality badge – shows the rendition currently being downloaded */}
              {currentQualityLabel && (
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 shadow-lg px-2.5 py-1.5 rounded-lg text-white/90 text-xs font-semibold tracking-wide select-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
                  <span>
                    {selectedQuality === 'auto' ? `Auto · ${currentQualityLabel}` : currentQualityLabel}
                  </span>
                    {/* Show HD badge for 720p and above */}
                    {(currentQualityLabel === '1080p' || currentQualityLabel === '720p') && (
                      <span className={`px-2 py-1 rounded text-xs font-semibold tracking-wide select-none text-white/90 ${
                        currentQualityLabel === '1080p' ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        HD
                      </span>
                    )}
                </div>
              )}

              <div className="relative group">
                <select
                  aria-label="Video quality"
                  className="appearance-none bg-black/60 backdrop-blur-md border border-white/10 shadow-lg hover:bg-black/80 hover:border-white/20 transition-all duration-200 text-white/90 text-sm font-medium px-3 py-1.5 pr-8 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-white/20"
                  value={selectedQuality}
                  onChange={(event) => selectQuality(event.target.value)}
                >
                  <option value="auto" className="bg-neutral-900 text-white">Auto Quality</option>
                  {qualities.map((quality) => (
                    <option key={quality.id} value={quality.id} className={`text-white ${selectedQuality === quality.id ? 'bg-white/10' : ''}`}>
                      {quality.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/70 group-hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f1f1f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline> 
                  </svg>
                </div>
              </div>
            </div>
          )}
        </>,
        vjsContainer
      ) : null}
    </div>
  );
};

export default HlsPlayer;
