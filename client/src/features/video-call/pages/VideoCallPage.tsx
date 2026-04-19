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
import { Loader2, Star } from 'lucide-react';
import { Lobby } from '../components/Lobby';
import Modal from '@shared/ui/Modal';
import ReviewForm from '@features/review/components/ReviewForm';
import { UserRole } from '@shared/enums/UserRole';
import { BookingStatus } from '@shared/enums/BookingStatus';

export const VideoCallPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isValidating, setIsValidating] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showNotCompletedModal, setShowNotCompletedModal] = useState(false);

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
        setBookingStatus(result.status);
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
    // Show rating modal for students after call ends if completed
    if (user?.role === UserRole.STUDENT && bookingId) {
      if (bookingStatus === BookingStatus.COMPLETED) {
        setShowRatingModal(true);
      } else {
        setShowNotCompletedModal(true);
      }
    } else {
      navigate(-1);
    }
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

      {/* Post-Call Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          navigate(-1);
        }}
        title=""
      >
        <div className="space-y-4">
          <div className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">How was your session?</h2>
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your feedback helps instructors improve. It only takes a second!
            </p>
          </div>
          {bookingId && (
            <ReviewForm
              targetType="session"
              targetId={bookingId}
              onSuccess={(rating) => {
                try {
                  const saved = localStorage.getItem('student_session_ratings');
                  const ratings = saved ? JSON.parse(saved) : {};
                  ratings[bookingId] = rating;
                  localStorage.setItem('student_session_ratings', JSON.stringify(ratings));
                } catch {
                  // ignore
                }
                setShowRatingModal(false);
                navigate(-1);
              }}
              onCancel={() => {
                setShowRatingModal(false);
                navigate(-1);
              }}
            />
          )}
        </div>
      </Modal>

      {/* Post-Call Not Completed Modal */}
      <Modal
        isOpen={showNotCompletedModal}
        onClose={() => {
          setShowNotCompletedModal(false);
          navigate(-1);
        }}
        title=""
      >
        <div className="space-y-4 p-4">
          <div className="text-center pb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Session Ended</h2>
            <p className="text-md text-gray-600 dark:text-gray-300">
              Your session time hasn't officially concluded yet. 
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Once the scheduled time finishes, the session will be marked as completed automatically. You'll then be able to review and rate this session from your <strong> Bookings</strong> page.
            </p>
          </div>
          <div className="flex justify-center mt-6">
        
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VideoCallPage;

