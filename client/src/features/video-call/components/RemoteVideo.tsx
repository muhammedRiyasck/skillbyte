import { useEffect, useRef } from 'react';
import { MicOff, RefreshCw, User, VideoOff } from 'lucide-react';
import Logo from '@/assets/OrginalLogo.png';
import { getInitials } from '../utils/getIntials';
import { VideoConnectionState } from '../../../shared/enums/VideoConnectionState';

interface RemoteVideoProps {
  stream: MediaStream | null;
  participantName?: string;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  profileImage?: string | undefined;
  connectionState: RTCPeerConnectionState;
  onRetry?: () => void;
}


export const RemoteVideo = ({
  stream,
  participantName,
  isVideoEnabled = true,
  isAudioEnabled = true,
  profileImage,
  connectionState,
  onRetry,
}: RemoteVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const attachStream = async (element: HTMLMediaElement | null) => {
      if (!element) return;

      element.srcObject = stream;
      if (stream) {
        try {
          await element.play();
        } catch (error) {

          console.warn('Remote media playback was blocked:', error);
        }
      }
    };

    void attachStream(audioRef.current);
    void attachStream(videoRef.current);
  }, [stream, connectionState, isVideoEnabled]);

  const showVideo = stream && isVideoEnabled && connectionState === VideoConnectionState.CONNECTED && stream.getVideoTracks().length > 0;
  const isConnected = connectionState === VideoConnectionState.CONNECTED;

  return (
    <div className="relative w-full h-full bg-zinc-900">
      {/* Audio must stay mounted even when the participant's camera is off. */}
      <audio ref={audioRef} autoPlay playsInline />

      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full bg-black object-contain"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 relative">
          {/* skillbyte logo */}
          <div className="absolute top-4 right-4">
            <img src={Logo} alt="Logo" className="w-26 h-auto" />
          </div>

          {/* participant profile */}
          <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center mb-4 overflow-hidden border-4 border-indigo-500 shadow-xl">
            {profileImage ? (
              <img src={profileImage} alt={participantName} className="w-full h-full object-cover" />
            ) : participantName ? (
              <span className="text-3xl font-bold text-white tracking-wider">{getInitials(participantName)}</span>
            ) : (
              <User size={64} className="text-white" />
            )}
          </div>
          <p className="text-xl text-white font-medium tracking-wide">
            {participantName || 'No User'}
          </p>
          {connectionState === 'connecting' && (
            <p className="text-sm text-gray-400 mt-2">Connecting...</p>
          )}
          {connectionState === 'disconnected' && (
            <p className="text-sm text-gray-400 mt-2">Disconnected</p>
          )}
          {connectionState === 'failed' && (
            <div className="flex flex-col items-center">
              <p className="text-sm text-red-400 mt-2 mb-2">Connection failed</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-2 cursor-pointer bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Retry Connection
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Connection Status Indicator */}
      {connectionState !== VideoConnectionState.CONNECTED && (
        <div className="absolute top-4 left-4 bg-yellow-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-900 font-medium">
          {connectionState === VideoConnectionState.CONNECTING && 'Connecting...'}
          {connectionState === VideoConnectionState.NEW && 'Initializing...'}
          {connectionState === VideoConnectionState.DISCONNECTED && 'Reconnecting...'}
          {connectionState === VideoConnectionState.FAILED && 'Connection failed'}
        </div>
      )}

      {/* Mic / Camera status icons — top-left, visible on both video and avatar views */}
      {isConnected && (!isAudioEnabled || !isVideoEnabled) && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {!isAudioEnabled && (
            <div className="bg-red-500/90 backdrop-blur-sm p-1.5 rounded-full" title="Microphone off">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          )}
          {!isVideoEnabled && (
            <div className="bg-red-500/90 backdrop-blur-sm p-1.5 rounded-full" title="Camera off">
              <VideoOff className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Participant Name */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded text-sm text-white">
        {participantName || 'Participant'}
      </div>
    </div>
  );
};
