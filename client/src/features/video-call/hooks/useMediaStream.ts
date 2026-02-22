import { useEffect, useRef, useState, useCallback } from 'react';

export interface MediaStreamState {
  stream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  error: string | null;
}

export const useMediaStream = () => {
  const [mediaState, setMediaState] = useState<MediaStreamState>({
    stream: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
    error: null,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
        isMountedRef.current = false;
    };
  }, []);

  const startMediaStream = useCallback(async () => {
    try {
      // Clear previous error state
      setMediaState((prev) => ({ ...prev, error: null }));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!isMountedRef.current) {
          console.warn('Media stream acquired after unmount. Stopping immediately.');
          stream.getTracks().forEach(t => t.stop());
          return null;
      }

      streamRef.current = stream;
      setMediaState({
        stream,
        isAudioEnabled: true,
        isVideoEnabled: true,
        error: null,
      });

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      if (isMountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to access camera/microphone';
        setMediaState((prev) => ({
            ...prev,
            error: errorMessage,
            isAudioEnabled: false,
            isVideoEnabled: false,
        }));
      }
      throw error;
    }
  }, []);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
          track.stop();
          streamRef.current?.removeTrack(track);
      });
      streamRef.current = null;
      setMediaState({
        stream: null,
        isAudioEnabled: false,
        isVideoEnabled: false,
        error: null,
      });
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMediaState((prev) => ({
          ...prev,
          isAudioEnabled: audioTrack.enabled,
        }));
      }
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (mediaState.isVideoEnabled) {
      // Turn OFF video: Stop the track to turn off hardware light
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop(); // Completely stop the track
          streamRef.current.removeTrack(videoTrack);
          
          // Force new reference string to trigger effects
          const updatedStream = new MediaStream(streamRef.current.getTracks());
          streamRef.current = updatedStream;
          setMediaState((prev) => ({ ...prev, isVideoEnabled: false, stream: updatedStream }));
        }
      } else {
         setMediaState((prev) => ({ ...prev, isVideoEnabled: false }));
      }
    } else {
      // Turn ON video: Request new video track
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        
        if (streamRef.current) {
          streamRef.current.addTrack(newVideoTrack);
           // Force new reference string to trigger effects
          const updatedStream = new MediaStream(streamRef.current.getTracks());
          streamRef.current = updatedStream;
          setMediaState((prev) => ({ ...prev, isVideoEnabled: true, stream: updatedStream }));
        } else {
            // Re-initialize if stream is missing
            streamRef.current = newStream;
            setMediaState((prev) => ({ ...prev, isVideoEnabled: true, stream: newStream }));
        }
      } catch {
        setMediaState((prev) => ({ 
            ...prev, 
            error: 'Failed to restart camera' 
        }));
      }
    }
  }, [mediaState.isVideoEnabled]);

  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  return {
    mediaState,
    startMediaStream,
    stopMediaStream,
    toggleAudio,
    toggleVideo,
  };
};
