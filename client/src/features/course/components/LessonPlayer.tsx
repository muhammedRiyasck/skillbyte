import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLessonPlayUrl } from "@/features/course/services/PlayUrlService";
import { updateLessonProgress } from "@/features/course/services/LessonProgress";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, X, WifiOff, Flag } from "lucide-react";
import ErrorPage from "@shared/ui/ErrorPage";
import { toast } from "sonner";
import ReportModal from '@/shared/components/ReportModal';
import { submitReport } from '@features/review/services/ReviewService';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/Index';
import { UserRole } from '@shared/enums/UserRole';
import HlsPlayer from './HlsPlayer';

interface LessonPlayerProps {
  id: string;
  onClose: () => void;
  title?: string;
  enrollmentId?: string;
  initialProgress?: number;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ id, onClose, title, enrollmentId, initialProgress = 0 }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialSeekDone = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const role = useSelector((state: RootState) => state.auth.user?.role);

  const queryClient = useQueryClient();
  const lastSavedTime = useRef(0);
  const isSaving = useRef(false);
  // Refs mirroring state so event handlers (beforeunload, visibilitychange)
  // can read the latest values synchronously without stale closures.
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);

  const saveProgress = async (time: number, total: number, completed: boolean) => {
    if (!enrollmentId) return;
    // Guard: skip if a save request is already in flight
    if (isSaving.current) return;
    try {
      isSaving.current = true;
      lastSavedTime.current = time;
      await updateLessonProgress(enrollmentId, {
        lessonId: id,
        lastWatchedSecond: time,
        totalDuration: total,
        isCompleted: completed,
      });
      // Only refetch enrollment data when the lesson is marked complete,
      // not on every intermediate 5-second heartbeat save.
      if (completed) {
        queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      }
    } catch (err) {
      console.warn("Progress save failed, retrying in 2s…", err);
      // One automatic retry after a short delay — fire-and-forget so it
      // doesn't block playback. Show a toast only if the retry also fails.
      setTimeout(async () => {
        try {
          await updateLessonProgress(enrollmentId, {
            lessonId: id,
            lastWatchedSecond: time,
            totalDuration: total,
            isCompleted: completed,
          });
        } catch (retryErr) {
          console.error("Progress save retry also failed", retryErr);
          toast.error("Couldn't save your progress. Check your connection.");
        }
      }, 2000);
    } finally {
      isSaving.current = false;
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lessonPlayUrl", id],
    queryFn: () => getLessonPlayUrl(id),
    enabled: !!id,
    // Signed URLs are valid for hours — avoid re-fetching on every render.
    // Still refetch when processing, and when the cache expires after 5 min.
    staleTime: 5 * 60 * 1000,
    refetchInterval: (query) => {
      // If it's still processing, refetch every 10 seconds to check if it's done
      return query.state.data?.data?.isProcessing ? 10000 : false;
    }
  });

  const signedUrl = data?.data?.signedUrl;
  const hlsUrl = data?.data?.hlsUrl;
  const isProcessing = data?.data?.isProcessing;

  // Reset state when lessonId changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffering(false);
    setIsSlowConnection(false);
    initialSeekDone.current = false; // Reset seek flag

    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [id, initialProgress]);

  // Handle online/offline status
  useEffect(() => {
    // Named handlers are required so removeEventListener can match the exact
    // same function reference — inline arrows would create new functions each
    // time and the listeners would never actually be removed (memory leak).
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle buffering timeout for slow connection detection
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (buffering && !isOffline) {
      timeoutId = setTimeout(() => {
        setIsSlowConnection(true);
      }, 5000); // 5 seconds threshold
    } else {
      setIsSlowConnection(false);
    }
    return () => clearTimeout(timeoutId);
  }, [buffering, isOffline]);

  // Handle time update and progress saving
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    setCurrentTime(time);
    currentTimeRef.current = time;

    // Sync progress every 5 seconds or if it's the end
    if (enrollmentId && Math.abs(time - lastSavedTime.current) > 5) {
      saveProgress(time, video.duration, false);
    } else if (!enrollmentId) {
      if (Math.abs(time % 5) < 0.3 && time > 1) {
        console.warn("Cannot save progress: No enrollmentId provided");
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      durationRef.current = videoRef.current.duration;

      // Seek to initial progress if provided and not yet done
      if (initialProgress > 0 && !initialSeekDone.current) {
        videoRef.current.currentTime = initialProgress;
        setCurrentTime(initialProgress);
        initialSeekDone.current = true;
        // Show toast notification
        toast.custom(() => (
          <div className="text-black dark:bg-gray-800 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Play className="w-5 h-5" />
            <span>Resumed from your last watched.</span>
          </div>
        ), {
          duration: 3000,
        });
      }
    }
  };

  const handleWaiting = () => setBuffering(true);

  const handleCanPlay = () => {
    setBuffering(false);
  };

  const handleEnded = (endedDuration?: number) => {
    setIsPlaying(false);
    if (enrollmentId) {
      const finalDuration = endedDuration ?? videoRef.current?.duration ?? duration;
      saveProgress(finalDuration, finalDuration, true);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Save progress when the user hides the tab, navigates away, or closes the browser.
  // These events fire synchronously so we use sendBeacon (fire-and-forget) for
  // beforeunload, and the normal async saveProgress for visibilitychange.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const time = currentTimeRef.current;
        const total = durationRef.current;
        if (enrollmentId && time > 0 && Math.abs(time - lastSavedTime.current) > 1) {
          saveProgress(time, total, false);
        }
      }
    };

    const handleBeforeUnload = () => {
      const time = currentTimeRef.current;
      const total = durationRef.current;
      if (!enrollmentId || time <= 0) return;
      // sendBeacon keeps the request alive even as the page tears down.
      const payload = JSON.stringify({
        lessonId: id,
        lastWatchedSecond: time,
        totalDuration: total,
        isCompleted: false,
      });
      navigator.sendBeacon(
        `/api/enrollment/${enrollmentId}/lesson-progress`,
        new Blob([payload], { type: 'application/json' })
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId, id]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "f" || e.key === "F") {
      toggleFullscreen();
    }
    if (e.key === "m" || e.key === "M") {
      toggleMute();
    }
    if (e.key === " ") {
      e.preventDefault();
      togglePlayPause();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (videoRef.current) {
        videoRef.current.currentTime += 10;
      }
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (videoRef.current) {
        videoRef.current.currentTime -= 10;
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (videoRef.current) {
        const newVolume = Math.min(videoRef.current.volume + 0.1, 1);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
      }

    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (videoRef.current) {
        const newVolume = Math.max(videoRef.current.volume - 0.1, 0);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReportLesson = async (reason: string, description: string) => {
    try {
      await submitReport('lesson', id, reason, description);
      toast.success('Lesson reported to administrators');
    } catch {
      toast.error('Failed to report lesson');
      throw new Error('Failed to report');
    }
  };

  const openReportModal = () => {
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setIsReportModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-900 flex items-center justify-center rounded-xl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-96 bg-gray-900 rounded-xl relative overflow-hidden">
        <ErrorPage message={(error as Error)?.message || "Failed to load lesson"} statusCode={403} />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="w-full h-96 bg-gray-900 flex flex-col items-center justify-center rounded-xl relative">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <h3 className="text-xl text-white font-semibold mb-2">Processing Video</h3>
        <p className="text-gray-400 text-center max-w-md px-4">
          This lesson is currently being transcoded to provide high-quality adaptive streaming. 
          Please check back in a few minutes.
        </p>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
      {/* Header bar (optional) */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <h3 className="text-white font-medium truncate">{title || "Playing Lesson"}</h3>
        <div className="flex items-center gap-4">
          {role === UserRole.STUDENT && (
            <button
              onClick={openReportModal}
              className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
              title="Report this lesson"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Close Player</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full bg-black aspect-video group outline-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {hlsUrl ? (
          <HlsPlayer
            src={hlsUrl}
            initialTime={initialProgress}
            onTimeUpdate={(time, dur) => {
              setCurrentTime(time);
              setDuration(dur);
              // Keep refs in sync so visibilitychange/beforeunload handlers
              // have the latest values without stale closures.
              currentTimeRef.current = time;
              durationRef.current = dur;
              if (enrollmentId && Math.abs(time - lastSavedTime.current) > 5) {
                saveProgress(time, dur, false);
              }
            }}
            onEnded={handleEnded}
            onResumed={() => {
              toast.custom(() => (
                <div className="text-black dark:bg-gray-800 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  <span>Resumed from your last watched.</span>
                </div>
              ), {
                duration: 3000,
              });
            }}
          />
        ) : (
          <>
            {/* Fallback Native Video Element for older MP4s */}
            <video
              ref={videoRef}
              src={signedUrl}
              className="w-full h-full"
              onClick={togglePlayPause}
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onDurationChange={handleLoadedMetadata}
              onWaiting={handleWaiting}
              onCanPlay={handleCanPlay}
              onEnded={() => handleEnded()}
            />

            {/* Controls Overlay (Only for native video) */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                }`}
            >
              {/* Progress Bar */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mb-4"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100
                    }%, #4b5563 100%)`,
                }}
              />

              {/* Control Buttons */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button onClick={togglePlayPause} className="hover:text-indigo-400 transition-colors cursor-pointer">
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="hover:text-indigo-400 transition-colors cursor-pointer ">
                      {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="hover:text-indigo-400 transition-colors  cursor-pointer">
                  {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Offline Indicator */}
        {isOffline && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-20">
            <WifiOff className="w-16 h-16 text-gray-400 mb-4" />
            <div className="bg-red-900/80 px-6 py-3 rounded-lg text-white text-center backdrop-blur-sm">
              <p className="font-bold text-lg mb-1">No Internet Connection</p>
              <p className="text-sm text-red-100">Please check your network settings.</p>
            </div>
          </div>
        )}

        {/* Buffering Indicator */}
        {buffering && !isOffline && !hlsUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 pointer-events-none z-10">
            <Loader2 className="w-16 h-16 animate-spin text-white mb-4" />
            {isSlowConnection && (
              <div className="bg-black/80 px-4 py-2 rounded-lg text-white text-center">
                <p className="font-semibold text-yellow-500">Poor Connection Detected</p>
                <p className="text-sm text-gray-300">The video is taking longer than usual to load.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportLesson}
        targetName={title}
        targetType="lesson"
      />
    </div>
  );
};

export default LessonPlayer;
