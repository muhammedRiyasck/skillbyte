import { useEffect, useState, useCallback } from 'react';
import type { IMessage } from '../types/IMessage';
import { useSocket } from '@/context/SocketContext';

interface TypingUser {
  userId: string;
  conversationId: string;
}

export const useChatSocket = (userId?: string, conversationId?: string) => {
  const { socket, isConnected } = useSocket();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState<IMessage | null>(null);
  const [lastReadEvent, setLastReadEvent] = useState<{ conversationId: string; userId: string; timestamp: Date } | null>(null);
 
  // Join/leave conversation room
  useEffect(() => {
    if (!socket || !conversationId || !isConnected) return;

    socket.emit('chat:join-conversation', conversationId);

    return () => {
      socket.emit('chat:leave-conversation', conversationId);
    };
  }, [socket, conversationId, isConnected]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: IMessage) => {
      setNewMessage(message);
    };

    const handleMessagesRead = (data: { conversationId: string; userId: string; timestamp: Date }) => {
      setLastReadEvent(data);
    };

    socket.on('chat:new-message', handleNewMessage);
    socket.on('chat:messages-read', handleMessagesRead);

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off('chat:messages-read', handleMessagesRead);
    };
  }, [socket]);

  // Listen for unread messages count
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleUnreadCount = (count: number) => {
      setUnreadCount(count);
    };

    socket.on('chat:unread-count', handleUnreadCount);

    return () => {
      socket.off('chat:unread-count', handleUnreadCount);
    };
  }, [socket, conversationId]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleUserTyping = ({ userId: typingUserId }: TypingUser) => {
      setTypingUsers((prev) => {
        if (!prev.includes(typingUserId)) {
          return [...prev, typingUserId];
        }
        return prev;
      });
    };

    const handleUserStopTyping = ({ userId: typingUserId }: TypingUser) => {
      setTypingUsers((prev) => prev.filter((id) => id !== typingUserId));
    };

    socket.on('chat:user-typing', handleUserTyping);
    socket.on('chat:user-stop-typing', handleUserStopTyping);

    return () => {
      socket.off('chat:user-typing', handleUserTyping);
      socket.off('chat:user-stop-typing', handleUserStopTyping);
    };
  }, [socket, conversationId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (socket && conversationId && userId) {
        const event = isTyping ? 'chat:typing' : 'chat:stop-typing';
        socket.emit(event, { conversationId, userId });
      }
    },
    [socket, conversationId, userId],
  );

  return {
    socket,
    isConnected,
    typingUsers,
    newMessage,
    lastReadEvent,
    unreadCount,
    sendTypingIndicator,
  };
};
