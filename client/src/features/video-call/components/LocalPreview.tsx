import { useEffect, useRef } from 'react';
import { User, GripVertical, CameraOff, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/assets/OrginalLogo.png';
import { getInitials } from '../utils/getIntials';

interface LocalPreviewProps {
  stream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  name?: string | undefined;
  profileImage?: string | undefined;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isDraggable?: boolean;
}

export const LocalPreview = ({
  stream,
  isVideoEnabled,
  isAudioEnabled,
  name,
  profileImage,
  containerRef,
  isDraggable = true
}: LocalPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoEnabled]);

  return (
    <motion.div
      drag={isDraggable} // Conditional drag
      {...(isDraggable && containerRef ? { dragConstraints: containerRef } : {})}
      dragElastic={0.1}
      dragMomentum={false}
      {...(isDraggable ? { whileDrag: { scale: 1.05, zIndex: 50 } } : {})}
      className={`
        bg-zinc-900 overflow-hidden
        ${isDraggable
          ? 'absolute bottom-8 right-8 w-64 h-48 rounded-2xl shadow-xl border border-white/10 ring-1 ring-black/20 z-40 cursor-grab active:cursor-grabbing group'
          : 'relative w-full h-full rounded-2xl border border-white/10'
        }
      `}
    >
      {/* Drag Handle Overlay (visible on hover only if draggable) */}
      {isDraggable && (
        <div className="absolute top-3 left-3 z-50 p-1.5 bg-black/40 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <GripVertical size={14} className="text-white/80" />
        </div>
      )}

      {isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover mirror pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 relative pointer-events-none">
          <div className="absolute top-4 right-4">
            {/* can we change the color to white */}
            <img src={Logo} alt="Logo" className="w-14 h-auto " />
          </div>

          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4 overflow-hidden ring-4 ring-indigo-500/10">
            {profileImage ? (
              <img src={profileImage} alt={name} className="w-full h-full object-cover " />
            ) : name ? (
              <span className="text-2xl font-bold text-white tracking-wider">{getInitials(name)}</span>
            ) : (
              <User size={32} className="text-indigo-400" />
            )}
          </div>
          <p className="text-white font-medium text-sm">Camera is off</p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none flex items-end p-4">
        <div className="flex items-center justify-between w-full">
          <span className="p-1.5 text-white font-medium text-sm tracking-wide text-shadow-sm">
            You
          </span>

          <div className="flex items-center gap-2">
            {!isVideoEnabled && (
              <div className="p-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
                <CameraOff size={14} className="text-red-400" />
              </div>
            )}
            {!isAudioEnabled && (
              <div className="p-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
                <MicOff size={14} className="text-red-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
