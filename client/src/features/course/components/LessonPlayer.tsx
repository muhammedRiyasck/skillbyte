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
  const [buffering, setBuffering] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [initialSignedUrl, setInitialSignedUrl] = useState<string | null>(null);

  const role = useSelector((state: RootState) => state.auth.user?.role);

  const queryClient = useQueryClient();
  const lastSavedTime = useRef(0);
  const isSaving = useRef(false);
  const pendingSave = useRef<{ time: number; total: number; completed: boolean } | null>(null);
  const hasCompleted = useRef(false);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);

  const saveProgress = async (time: number, total: number, completed: boolean) => {
    if (!enrollmentId) return;

    if (completed) {
      hasCompleted.current = true;
    }

    if (isSaving.current) {
      pendingSave.current = {
        time,
        total,
        completed: completed || (pendingSave.current?.completed ?? false),
      };
      return;
    }

    try {
      isSaving.current = true;
      lastSavedTime.current = time;
      const isDone = completed || hasCompleted.current;
      await updateLessonProgress(enrollmentId, {
        lessonId: id,
        lastWatchedSecond: time,
        totalDuration: total || 0,
        isCompleted: isDone,
      });

      if (isDone) {
        queryClient.invalidateQueries({ queryKey: ["enrollmentStatus"] });
        queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
      }
    } catch (err) {
      console.warn("Progress save failed, retrying in 2s…", err);
      setTimeout(async () => {
        try {
          const isDone = completed || hasCompleted.current;
          await updateLessonProgress(enrollmentId, {
            lessonId: id,
            lastWatchedSecond: time,
            totalDuration: total || 0,
            isCompleted: isDone,
          });
          if (isDone) {
            queryClient.invalidateQueries({ queryKey: ["enrollmentStatus"] });
            queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
          }
        } catch (retryErr) {
          console.error("Progress save retry also failed", retryErr);
          toast.error("Couldn't save your progress. Check your connection.");
        }
      }, 2000);
    } finally {
      isSaving.current = false;
      if (pendingSave.current) {
        const next = pendingSave.current;
        pendingSave.current = null;
        saveProgress(next.time, next.total, next.completed);
      }
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lessonPlayUrl", id],
    queryFn: () => getLessonPlayUrl(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchInterval: (query) => {
      return query.state.data?.data?.isProcessing ? 10000 : false;
    }
  });

  const signedUrl = data?.data?.signedUrl;
  const hlsUrl = data?.data?.hlsUrl;
  const isProcessing = data?.data?.isProcessing;


  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffering(false);
    setIsSlowConnection(false);
    initialSeekDone.current = false; // Reset seek flag
    lastSavedTime.current = 0;
    hasCompleted.current = false;
    pendingSave.current = null;
    setInitialSignedUrl(null);

    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [id]);

  useEffect(() => {
    if (signedUrl && !initialSignedUrl) {
      setInitialSignedUrl(signedUrl);
    }
  }, [signedUrl, initialSignedUrl]);


  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);


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


  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const time = video.currentTime;
    const dur = video.duration || durationRef.current || 0;
    setCurrentTime(time);
    currentTimeRef.current = time;
    if (dur > 0) {
      durationRef.current = dur;
    }
    const isNearEnd = dur > 0 && (time / dur >= 0.95 || time >= dur - 1);
    if (isNearEnd && !hasCompleted.current) {
      hasCompleted.current = true;
      saveProgress(time, dur, true);
    } else if (enrollmentId && Math.abs(time - lastSavedTime.current) > 5) {
      saveProgress(time, dur, hasCompleted.current);
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

      if (initialProgress > 0 && !initialSeekDone.current) {
        videoRef.current.currentTime = initialProgress;
        setCurrentTime(initialProgress);
        initialSeekDone.current = true;

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
    hasCompleted.current = true;
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


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const time = currentTimeRef.current;
        const total = durationRef.current;
        if (enrollmentId && time > 0 && Math.abs(time - lastSavedTime.current) > 1) {
          saveProgress(time, total, hasCompleted.current);
        }
      }
    };

    const handleBeforeUnload = () => {
      const time = currentTimeRef.current;
      const total = durationRef.current;
      if (!enrollmentId || time <= 0) return;
      const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
      const payload = JSON.stringify({
        lessonId: id,
        lastWatchedSecond: time,
        totalDuration: total || 0,
        isCompleted: hasCompleted.current,
      });
      navigator.sendBeacon(
        `${apiUrl}/enrollment/${enrollmentId}/lesson-progress`,
        new Blob([payload], { type: 'application/json' })
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);


      const time = currentTimeRef.current;
      const total = durationRef.current;
      if (enrollmentId && time > 0) {
        updateLessonProgress(enrollmentId, {
          lessonId: id,
          lastWatchedSecond: time,
          totalDuration: total || 0,
          isCompleted: hasCompleted.current,
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["enrollmentStatus"] });
          queryClient.invalidateQueries({ queryKey: ["enrolled-courses"] });
        }).catch((err) => {
          console.warn("Unmount progress save error", err);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId, id]);



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

type ScreenOrientationLock =
  | 'any' | 'natural' | 'landscape' | 'portrait'
  | 'portrait-primary' | 'portrait-secondary'
  | 'landscape-primary' | 'landscape-secondary';

interface OrientationWithLock extends ScreenOrientation {
  lock(orientation: ScreenOrientationLock): Promise<void>;
  unlock(): void;
}

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
        const orientation = window.screen?.orientation as OrientationWithLock | undefined;
        if (orientation && orientation.lock) {
          try {
            await orientation.lock("landscape");
          } catch (e) {
            console.warn("Screen orientation lock not supported or failed", e);
          }
        }
      } else {
        await document.exitFullscreen();
        const orientation = window.screen?.orientation as OrientationWithLock | undefined;
        if (orientation && orientation.unlock) {
          orientation.unlock();
        }
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

  if (!data?.data) {
    return (
      <div className="w-full h-96 bg-gray-900 flex flex-col items-center justify-center rounded-xl relative">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <h3 className="text-xl text-white font-semibold mb-2">Loading</h3>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 animate-in fade-in zoom-in-95 duration-300">
      {/* Header bar */}
      <div className="bg-neutral-900/80 backdrop-blur-md px-5 py-3 flex items-center justify-between border-b border-white/10 relative z-10">
        <h3 className="text-white font-semibold tracking-wide truncate flex items-center gap-2">
          <Play className="w-4 h-4 text-indigo-500" />
          {title || "Playing Lesson"}
        </h3>
        <div className="flex items-center gap-3">
          {role === UserRole.STUDENT && (
            <button
              onClick={openReportModal}
              className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200 flex items-center gap-1.5 text-sm cursor-pointer border border-white/5 hover:border-red-500/30"
              title="Report this lesson"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200 flex items-center gap-1.5 text-sm cursor-pointer border border-white/5"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative w-full bg-black flex items-center justify-center group outline-none ${isFullscreen ? "h-screen" : "aspect-video max-h-[85vh]"}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {isProcessing && ( 
          <div className="absolute top-4 left-4 z-[60] bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-white text-xs flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
            <span>Processing HD qualities... Playing original video</span>
          </div>
        )}
        {hlsUrl ? (
          <HlsPlayer
            src={hlsUrl}
            initialTime={currentTimeRef.current > 0 ? currentTimeRef.current : initialProgress}
            onTimeUpdate={(time, dur) => {
              setCurrentTime(time);
              setDuration(dur);
              currentTimeRef.current = time;
              durationRef.current = dur;

              const isNearEnd = dur > 0 && (time / dur >= 0.95 || time >= dur - 1);
              if (isNearEnd && !hasCompleted.current) {
                hasCompleted.current = true;
                saveProgress(time, dur, true);
              } else if (enrollmentId && Math.abs(time - lastSavedTime.current) > 5) {
                saveProgress(time, dur, hasCompleted.current);
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
          <div className="flex flex-col w-full h-full relative">
            {/* Fallback Native Video Element for older MP4s */}
            <div className="flex-1 min-h-0 relative bg-black cursor-pointer" onClick={togglePlayPause}>
              <video
                ref={videoRef}
                src={initialSignedUrl || signedUrl}
                className="absolute inset-0 w-full h-full object-contain"
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onDurationChange={handleLoadedMetadata}
                onWaiting={handleWaiting}
                onCanPlay={handleCanPlay}
                onEnded={() => handleEnded()}
              />
            </div>

            {/* Controls Bar Below Video (Always visible) */}
            <div className="bg-[#050505] border-t border-white/10 px-4 py-2.5 flex-shrink-0 z-10">
              {/* Progress Bar */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer mb-2.5"
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
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="hover:text-indigo-400 transition-colors cursor-pointer ">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
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
