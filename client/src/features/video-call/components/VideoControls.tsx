import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, Check } from 'lucide-react';

interface VideoControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  showEndCall?: boolean;
}

export const VideoControls = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  showEndCall = true,
}: VideoControlsProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const lobbyEnabled = localStorage.getItem('video-call-lobby-enabled') !== 'false';

  const toggleLobbySetting = () => {
    const newValue = !lobbyEnabled;
    localStorage.setItem('video-call-lobby-enabled', String(newValue));
    setShowSettings(false);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-full px-6 py-4 flex items-center gap-4 shadow-2xl border border-gray-700 relative">

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-4 cursor-pointer rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
            title="Settings"
          >
            <Settings size={24} />
          </button>

          {/* Settings Popup */}
          {showSettings && (
            <div className="absolute bottom-full left-0 mb-4 w-60 bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-4 overflow-hidden">
              <h4 className="text-white font-semibold mb-3 text-sm">Call Settings</h4>
              <div
                className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors"
                onClick={toggleLobbySetting}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${lobbyEnabled ? 'bg-indigo-600 border-indigo-600' : 'border-gray-500'}`}>
                  {lobbyEnabled && <Check size={14} className="text-white" />}
                </div>
                <span className="text-gray-300 text-sm">Show lobby before joining</span>
              </div>
            </div>
          )}
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-4 cursor-pointer rounded-full transition-all ${isAudioEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-4 cursor-pointer rounded-full transition-all ${isVideoEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        {/* End Call */}
        {showEndCall && (
          <button
            onClick={onEndCall}
            className="p-4 cursor-pointer rounded-full bg-red-600 hover:bg-red-700 text-white transition-all ml-2"
            title="End call"
          >
            <PhoneOff size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
