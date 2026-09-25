import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSocket } from '../../../context/SocketContext';
import { Zap } from 'lucide-react';

interface XpToast {
  id: string;
  xpEarned: number;
}

const XpToastManager: React.FC = () => {
  const { socket } = useSocket();
  const [toasts, setToasts] = useState<XpToast[]>([]);
  const [fullscreenElement, setFullscreenElement] = useState<Element | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreenElement(document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleXpEarned = (data: { xpEarned: number }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, xpEarned: data.xpEarned }]);


      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    socket.on('xp_earned', handleXpEarned);

    return () => {
      socket.off('xp_earned', handleXpEarned);
    };
  }, [socket]);

  if (toasts.length === 0) return null;

  const content = (
    <div className="pointer-events-none fixed bottom-10 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="
            mb-3 flex items-center gap-2.5
            rounded-full
            border border-yellow-400/20
            bg-[#0b1220]/95
            px-4 py-2.5
            shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(245,158,11,0.12)]
            backdrop-blur-xl
          "
          style={{
            animation: "xpReward 2.4s cubic-bezier(0.22,1,0.36,1) forwards",
          }}
        >
          <div
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full
              bg-yellow-400/10
              ring-1 ring-yellow-400/20
            "
          >
            <Zap
              size={17}
              strokeWidth={2.5}
              className="fill-yellow-300 text-yellow-300"
            />
          </div>

          <span className="text-sm font-medium text-gray-400">
            XP earned
          </span>

          <span className="text-base font-bold text-yellow-300">
            +{toast.xpEarned}
          </span>
        </div>
      ))}

      <style>
        {`
          @keyframes xpReward {
            0% {
              opacity: 0;
              transform: translateY(18px) scale(0.88);
            }

            15% {
              opacity: 1;
              transform: translateY(-2px) scale(1.03);
            }

            25% {
              transform: translateY(0) scale(1);
            }

            75% {
              opacity: 1;
              transform: translateY(-35px) scale(1);
            }

            100% {
              opacity: 0;
              transform: translateY(-65px) scale(0.96);
            }
          }
        `}
      </style>
    </div>
  );

  return fullscreenElement ? createPortal(content, fullscreenElement) : content;
};

export default XpToastManager;
