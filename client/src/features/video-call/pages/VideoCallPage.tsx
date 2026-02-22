import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/Index';
import { RemoteVideo } from '../components/RemoteVideo';
import { LocalPreview } from '../components/LocalPreview';
import { VideoControls } from '../components/VideoControls';
import { useMediaStream } from '../hooks/useMediaStream';
import { useWebRTC } from '../hooks/useWebRTC';
import { validateVideoRoomAccess } from '../services/videoCallServices';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Lobby } from '../components/Lobby';

export const VideoCallPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isValidating, setIsValidating] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    mediaState,
    startMediaStream,
    stopMediaStream,
    toggleAudio,
    toggleVideo,
  } = useMediaStream();

  const {
    remoteStream,
    connectionState,
    socket,
    remoteParticipant,
    remoteVideoEnabled,
    restartIce
  } = useWebRTC({
    roomId: roomId || '',
    userId: user?.id || '',
    localStream: mediaState.stream,
  });

  const userProfileImage = user?.profilePicture;

  // Validate access to video room
  useEffect(() => {
    const validateAccess = async () => {
      if (!roomId) {
        toast.error('Invalid video room');
        navigate('/student/bookings');
        return;
      }

      try {
        const result = await validateVideoRoomAccess(roomId);
        setBookingId(result.bookingId);
        setIsValidating(false);
      } catch (error) {
        console.error('Access validation failed:', error);
        navigate(-1);
      }
    };

    validateAccess();
  }, [roomId, navigate]);

  // Determine if we should show the lobby
  const [showLobby, setShowLobby] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    // If setting is 'false', lobby is disabled (stored as string 'false')
    const lobbyEnabled = localStorage.getItem('video-call-lobby-enabled') !== 'false';
    setShowLobby(lobbyEnabled);
  }, []);

  // START MEDIA STREAM (Independent of joining)
  useEffect(() => {
    const initMedia = async () => {
      if (!isValidating && !mediaState.stream && !mediaState.error) {
        await startMediaStream();
      }
    };
    initMedia();
  }, [isValidating, startMediaStream, mediaState.stream, mediaState.error]);

  // Logic to actually join the socket room
  const joinVideoRoom = useCallback(async () => {
    if (!roomId || !bookingId || !socket || isJoining || hasJoined) return;

    setIsJoining(true);
    try {
      if (!mediaState.stream) {
        try {
          await startMediaStream();
        } catch (mediaError) {
          console.warn('Joining without media access:', mediaError);
        }
      }

      // Join video room via socket
      socket.emit('video:join-room', {
        roomId,
        userId: user?.id,
        bookingId,
        name: user?.name || 'User',
        profileImage: userProfileImage,
        isVideoEnabled: mediaState.isVideoEnabled,
        isAudioEnabled: mediaState.isAudioEnabled,
      });

      setHasJoined(true);
      toast.success('Joined video call');
    } catch (error) {
      console.error('Failed to join room:', error);
      toast.error('Failed to join call');
    } finally {
      setIsJoining(false);
    }
  }, [
    roomId,
    bookingId,
    socket,
    isJoining,
    mediaState.stream,
    mediaState.isVideoEnabled,
    mediaState.isAudioEnabled,
    startMediaStream,
    user?.id,
    user?.name,
    userProfileImage,
    hasJoined
  ]);

  // Auto-join effect (only if lobby is disabled)
  // Wait for media stream or error to be ready before joining
  useEffect(() => {
    if (!isValidating && bookingId && socket && !hasJoined && !isJoining) {
      // Logic: If lobby is disabled, we must wait until we have a stream OR an error confirms no stream is coming
      if (!showLobby && (mediaState.stream || mediaState.error)) {
        joinVideoRoom();
      }
    }
  }, [isValidating, bookingId, socket, showLobby, hasJoined, isJoining, joinVideoRoom, mediaState.stream, mediaState.error]);

  // Cleanup on unmount - Stop Stream
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  // Handle leaving room (when dependencies change or unmount)
  useEffect(() => {
    return () => {
      if (socket && roomId && user?.id && hasJoined) {
        socket.emit('video:leave-room', {
          roomId,
          userId: user.id,
        });
      }
    };
  }, [socket, roomId, user, hasJoined]);

  const handleEndCall = () => {
    if (socket && roomId && user?.id) {
      socket.emit('video:leave-room', {
        roomId,
        userId: user.id,
      });
    }
    // stopMediaStream(); // Handled by cleanup effect
    toast.success('Call ended');
    navigate(-1);
  };

  const handleToggleAudio = () => {
    if (mediaState.error && !mediaState.stream) {
      toast.error(`Mic toggle failed: ${mediaState.error}`);
      return;
    }
    toggleAudio();
    if (socket && roomId && user?.id) {
      socket.emit('video:toggle-audio', {
        roomId,
        userId: user.id,
        enabled: !mediaState.isAudioEnabled,
      });
    }
  };

  const handleToggleVideo = () => {
    if (mediaState.error && !mediaState.stream) {
      toast.error(`Camera toggle failed: ${mediaState.error}`);
      return;
    }
    toggleVideo();
    if (socket && roomId && user?.id) {
      socket.emit('video:toggle-video', {
        roomId,
        userId: user.id,
        enabled: !mediaState.isVideoEnabled,
      });
    }
  };

  if (isValidating) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-white text-lg">Validating access...</p>
        </div>
      </div>
    );
  }

  if (showLobby && !hasJoined) {
    return (
      <Lobby
        stream={mediaState.stream}
        isVideoEnabled={mediaState.isVideoEnabled}
        isAudioEnabled={mediaState.isAudioEnabled}
        user={user ? { name: user.name, profilePicture: userProfileImage } : null}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onJoin={() => {
          setShowLobby(false);
          joinVideoRoom();
        }}
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-gray-900">
      {/* Remote Video (Full Screen) */}
      <div className="w-full h-full">
        {remoteParticipant ? (
          <RemoteVideo
            stream={remoteStream}
            participantName={remoteParticipant.name}
            connectionState={connectionState}
            profileImage={remoteParticipant.profileImage}
            isVideoEnabled={remoteVideoEnabled}
            onRetry={restartIce}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white">
            <div className="bg-zinc-800 p-8 rounded-2xl flex flex-col items-center shadow-xl border border-zinc-700">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <div className="relative w-10 h-10">
                    <span className="absolute inset-0 rounded-full bg-indigo-400/40 animate-ping" />
                    <span className="absolute inset-0 rounded-full bg-indigo-400/60" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Waiting for other to join...</h3>
              <p className="text-zinc-400 text-center max-w-xs">
                No other participants are currently in the room. Stay here and they will appear once they connect.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local Preview (Picture in Picture) */}
      <LocalPreview
        stream={mediaState.stream}
        isVideoEnabled={mediaState.isVideoEnabled}
        isAudioEnabled={mediaState.isAudioEnabled}
        name={user?.name}
        profileImage={userProfileImage}
        containerRef={containerRef}
        isDraggable={true}
      />

      {/* Video Controls */}
      <VideoControls
        isAudioEnabled={mediaState.isAudioEnabled}
        isVideoEnabled={mediaState.isVideoEnabled}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onEndCall={handleEndCall}
      />

      {/* Connection Status */}
      {mediaState.error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm">
          {mediaState.error}
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;
