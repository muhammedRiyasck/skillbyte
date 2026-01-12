import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatService } from '../services/ChatService';
import type { IMessage } from '../types/IMessage';
import type { IConversation } from '../types/IConversation';
import type { RootState } from '@core/store/Index';

import { ChatContext } from './ChatContext';


export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [lastGlobalMessage, setLastGlobalMessage] = useState<IMessage | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const processedMessageIds = useRef<Set<string>>(new Set());

  // Global query for conversations
  const { data: conversationsResponse, isLoading } = useQuery({
    queryKey: ['conversations', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      const response = await ChatService.getConversations();
      return response;
    },
    enabled: !!currentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const conversations = useMemo(() => {
    if (!conversationsResponse) return [];
    if (Array.isArray(conversationsResponse?.data)) return conversationsResponse.data;
    return [];
  }, [conversationsResponse]);

  // Calculate total unread count
  const totalUnreadCount = useMemo(() => {
    if (!currentUser || !Array.isArray(conversations)) return 0;
    return conversations.reduce((total: number, conv: IConversation) => {
      const count = currentUser.role === 'student' 
        ? conv.unreadCount?.student 
        : conv.unreadCount?.instructor;
      return total + (count || 0);
    }, 0);
  }, [conversations, currentUser]);

  const checkOnlineStatus = useCallback((userIds: string[]) => {
    if (socket) {
      socket.emit('user:check-status', userIds, (onlineIds: string[]) => {
        setOnlineUsers(prev => {
           const newSet = new Set(prev);
           onlineIds.forEach(id => newSet.add(id));
           return newSet;
        });
      });
    }
  }, [socket]);

  // Check online status for all users in conversations on load
  useEffect(() => {
    if (conversations.length > 0 && socket && currentUser) {
       const userIds = conversations.map((c: IConversation) => {
          return currentUser.role === 'student' ? c.instructor?.id : c.student?.id;
       }).filter(Boolean) as string[];
       
       if (userIds.length > 0) {
          checkOnlineStatus(userIds);
       }
    }
  }, [socket, currentUser,conversations,checkOnlineStatus]); // Depend on length to avoid loops, or check if we already checked

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleNewMessage = (message: IMessage) => {
      const messageId = (message.id || message._id) as string;
      
      // Deduplicate events (server sends to both room and user)
      if (processedMessageIds.current.has(messageId)) {
          return;
      }
      processedMessageIds.current.add(messageId);
      
      // Clear from set after 5 seconds to keep memory low
      setTimeout(() => {
          processedMessageIds.current.delete(messageId);
      }, 5000);

      // 1. Manually update the conversations list cache to show the new snippet and unread count
      queryClient.setQueryData(['conversations', currentUser.id], (oldData: {data: IConversation[]}) => {
        if (!oldData || !Array.isArray(oldData.data)) return oldData;
        
        const updatedConversations = oldData.data.map((conv: IConversation) => {
          if (conv.conversationId === message.conversationId) {
             const isStudent = currentUser.role === 'student';
             const newUnreadCount = { ...(conv.unreadCount || { student: 0, instructor: 0 }) };
             
             if (message.senderId !== currentUser.id) {
               if (isStudent) newUnreadCount.student = (newUnreadCount.student || 0) + 1;
               else newUnreadCount.instructor = (newUnreadCount.instructor || 0) + 1;
             }

             return {
               ...conv,
               lastMessage: {
                 content: message.content,
                 senderId: message.senderId,
                 timestamp: message.createdAt,
               },
               unreadCount: newUnreadCount,
               updatedAt: message.createdAt,
             };
          }
          return conv;
        });
        
        // Optional: Move the updated conversation to the top
        const sortedConversations = [...updatedConversations].sort((a, b) => 
          new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        );

        return { ...oldData, data: sortedConversations };
      });

      // 2. Manually update the messages cache if it exists (for the specific conversation)
      queryClient.setQueryData(
        ['messages', currentUser.id, message.conversationId],
        (oldData: {pages: {data: IMessage[]}[]}) => {
          if (!oldData || !Array.isArray(oldData.pages)) return oldData;

          const pages = [...oldData.pages];
          if (pages.length === 0) return oldData;

          // Add message to the first page (newest)
          const newestPage = { ...pages[0] };
          const currentMessages = Array.isArray(newestPage.data) ? newestPage.data : [];

          // Prevent duplicate messages
          if (currentMessages.some((m: IMessage) => (m.id || m._id) === (message.id || message._id))) {
            return oldData;
          }

          newestPage.data = [...currentMessages, message];
          pages[0] = newestPage;

          return { ...oldData, pages };
        }
      );

      // 3. Still invalidate as a background sync/fallback
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ['messages', currentUser.id, message.conversationId] });

      // Don't show toast for own messages
      if (message.senderId === currentUser.id) return;

      // Check if we are currently viewing this conversation
      const currentUrlParams = new URLSearchParams(window.location.search);
      const currentConversationId = currentUrlParams.get('conversationId');
      
      // If we are on the chat page and viewing this conversation, don't show toast
      if (window.location.pathname === '/chat' && currentConversationId === message.conversationId) {
          return;
      }
      
      setLastGlobalMessage(message);
      
      // Global toast notification
      toast(`New message from ${message.senderRole}`, {
          description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          action: {
              label: 'View',
              onClick: () => {
                  window.location.href = `/chat?conversationId=${message.conversationId}`;
              }
          }
      });
    };

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id] });
    };

    const handleMessagesRead = ({ conversationId, userId }: { conversationId: string; userId: string; timestamp: Date }) => {
      // 1. Update conversations list
      queryClient.setQueryData(['conversations', currentUser.id], (oldData: {data: IConversation[]}) => {
        if (!oldData || !Array.isArray(oldData.data)) return oldData;
        
        const updatedConversations = oldData.data.map((conv: IConversation) => {
          if (conv.conversationId === conversationId) {
             const isStudent = currentUser.role === 'student';
             const newUnreadCount = { ...(conv.unreadCount || { student: 0, instructor: 0 }) };

             // If WE read the messages, reset our unread count
             if (userId === currentUser.id) {
                if (isStudent) newUnreadCount.student = 0;
                else newUnreadCount.instructor = 0;
             }
             
             return { ...conv, unreadCount: newUnreadCount };
          }
          return conv;
        });
        return { ...oldData, data: updatedConversations };
      });

      // 2. Update messages list
      // If the OTHER person read it, mark all messages as read (visually for us)
      if (userId !== currentUser.id) {
         queryClient.setQueryData(['messages', currentUser.id, conversationId], (oldData: {pages: {data: IMessage[]}[]}) => {
            if (!oldData || !Array.isArray(oldData.pages)) return oldData;
            return {
                ...oldData,
                pages: oldData.pages.map((page: {data: IMessage[]}) => ({
                    ...page,
                    data: (page.data || []).map((m: IMessage) => ({ ...m, isRead: true }))
                }))
            };
         });
      }
      
      // Fallback
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id] });
    };

    const handleUserOnline = (userId: string) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    };

    const handleUserOffline = (userId: string) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    socket.on('chat:new-message', handleNewMessage);
    socket.on('chat:conversation-updated', handleUpdate);
    socket.on('chat:messages-read', handleMessagesRead);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('connect', handleUpdate);

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off('chat:conversation-updated', handleUpdate);
      socket.off('chat:messages-read', handleMessagesRead);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('connect', handleUpdate);
    };
  }, [socket, currentUser, queryClient]);

  // Handle user sessions (login/logout)
  useEffect(() => {
    if (currentUser?.id) {
       // User just logged in - refresh chat data
       queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id] });
    } else if (!currentUser) {
       // User logged out - clear all cache for security and consistency
       queryClient.clear();
       setOnlineUsers(new Set());
    }
  }, [currentUser, queryClient]);

  return (
    <ChatContext.Provider value={{ 
        lastGlobalMessage, 
        conversations, 
        totalUnreadCount, 
        isLoading,
        onlineUsers,
        checkOnlineStatus
    }}>
      {children}
    </ChatContext.Provider>
  );
};
