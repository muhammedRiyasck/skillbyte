import { useState, useEffect } from 'react';
import { LocalPreview } from './LocalPreview';
import { VideoControls } from './VideoControls';
import { Check } from 'lucide-react';

interface LobbyProps {
    stream: MediaStream | null;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    user: { name: string; profilePicture?: string | undefined } | null;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onJoin: () => void;
    onBack: () => void;
}

export const Lobby = ({
    stream,
    isVideoEnabled,
    isAudioEnabled,
    user,
    onToggleAudio,
    onToggleVideo,
    onJoin,
    onBack,
}: LobbyProps) => {
    const [alwaysJoinDirectly, setAlwaysJoinDirectly] = useState(false);

    useEffect(() => {
        // Check initial setting
        const storedSetting = localStorage.getItem('video-call-lobby-enabled');
        // If setting is 'false', it means lobby is DISABLED (so we join directly).
        // So "Always join directly" checkbox should be checked if setting is 'false'.
        if (storedSetting === 'false') {
            setAlwaysJoinDirectly(true);
        }
    }, []);

    const handleCheckboxChange = () => {
        const checked = !alwaysJoinDirectly;
        setAlwaysJoinDirectly(checked);
        localStorage.setItem('video-call-lobby-enabled', checked ? 'false' : 'true');
    };

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center justify-center">

                {/* Preview Section */}
                <div className="w-full max-w-2xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800">
                    <LocalPreview
                        stream={stream}
                        isVideoEnabled={isVideoEnabled}
                        isAudioEnabled={isAudioEnabled}
                        name={user?.name}
                        profileImage={user?.profilePicture}
                        isDraggable={false}
                    />

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <VideoControls
                            isAudioEnabled={isAudioEnabled}
                            isVideoEnabled={isVideoEnabled}
                            onToggleAudio={onToggleAudio}
                            onToggleVideo={onToggleVideo}
                            // Hide end call button in lobby
                            onEndCall={() => { }}
                            showEndCall={false}
                        />
                    </div>
                </div>

                {/* Join Controls Section */}
                <div className="flex flex-col gap-6 items-center md:items-start text-white w-full md:w-auto min-w-[300px]">

                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold">Ready to join?</h1>
                        <p className="text-gray-400">
                            {user?.name}, you are about to join the session.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={onJoin}
                            className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center"
                        >
                            Join Session
                        </button>

                        <button
                            onClick={onBack}
                            className="w-full cursor-pointer border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white py-3 rounded-xl transition-all flex items-center justify-center"
                        >
                            Cancel
                        </button>
                    </div>

                    <div
                        className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 w-full cursor-pointer select-none hover:bg-gray-800 transition-colors"
                        onClick={handleCheckboxChange}
                    >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${alwaysJoinDirectly ? 'bg-indigo-600 border-indigo-600' : 'border-gray-500 bg-transparent'}`}>
                            {alwaysJoinDirectly && <Check size={14} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium text-gray-300">
                            Always join directly next time
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
};
