import React, { useEffect, useRef, useState, useMemo, useContext } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { MoreVertical, User as UserIcon, Loader2 } from 'lucide-react';
import { ChatContext } from '../context/ChatContext';
import { ChatService } from '../services/ChatService';
import { useInView } from 'react-intersection-observer';
import { useChatSocket } from '../hooks/useChatSocket';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import type { IChatWindowProps } from '../types/IChatwindowProps';
import type { IMessage } from '../types/IMessage';
import { toast } from 'sonner';

const ChatWindow: React.FC<IChatWindowProps> = ({ currentUser, conversation, onBack }) => {
  const queryClient = useQueryClient();
  const { onlineUsers } = useContext(ChatContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollHeightRef = useRef<number>(0);
  
  const { ref: topSentinelRef, inView: isAtTop } = useInView({
    threshold: 0,
  });

  const oppositeUser = currentUser.role === 'student' ? conversation.instructor : conversation.student;
  const isOnline = oppositeUser ? onlineUsers.has(oppositeUser.id) : false;

  const { newMessage, lastReadEvent, typingUsers, sendTypingIndicator } = useChatSocket(
    currentUser.id,
    conversation.conversationId
  );

  // Fetch messages with infinite query
  const { 
    data: infiniteData, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteQuery({
    queryKey: ['messages', currentUser.id, conversation.conversationId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await ChatService.getMessages(conversation.conversationId, 50, pageParam as number);
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.data || lastPage.data.length < 50) return undefined;
      return allPages.length * 50;
    },
  });
  const messages = useMemo(() => {
    if (!infiniteData) return [];
    return infiniteData.pages.slice().reverse().flatMap(page => page.data || []);
  }, [infiniteData]);

  // Load more when scrolling to top
  useEffect(() => {
    if (isAtTop && hasNextPage && !isFetchingNextPage) {
      if (messagesContainerRef.current) {
        scrollHeightRef.current = messagesContainerRef.current.scrollHeight;
      }
      fetchNextPage();
    }
  }, [isAtTop, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll preservation when loading older messages
  useEffect(() => {
    if (!isFetchingNextPage && scrollHeightRef.current > 0 && messagesContainerRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const heightDiff = newScrollHeight - scrollHeightRef.current;
      if (heightDiff > 0) {
        messagesContainerRef.current.scrollTop = heightDiff;
      }
      scrollHeightRef.current = 0;
    }
  }, [messages, isFetchingNextPage]);

  // Initial scroll to bottom
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  useEffect(() => {
    if (!isLoading && messages.length > 0 && isInitialLoad) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      setIsInitialLoad(false);
    }
  }, [isLoading, messages.length, isInitialLoad]);

  // Handle new real-time message
  useEffect(() => {
    if (newMessage && newMessage.conversationId === conversation.conversationId) {
      queryClient.setQueryData(
        ['messages', currentUser.id, conversation.conversationId], 
        (oldData: {pages:{data:IMessage[]}[]}) => {
          if (!oldData) return oldData;
          
          const pages = [...oldData.pages];
          const newestPage = { ...pages[0] };
          const currentMessages = Array.isArray(newestPage.data) ? newestPage.data : [];
          
          if (currentMessages.some((m: IMessage) => (m.id || m._id) === (newMessage.id || newMessage._id))) {
            return oldData;
          }

          newestPage.data = [...currentMessages, newMessage];
          pages[0] = newestPage;

          return {
            ...oldData,
            pages
          };
        }
      );
      
      ChatService.markAsRead(conversation.conversationId);
      
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        if (isNearBottom) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  }, [newMessage, conversation.conversationId, currentUser.id, queryClient]);

  // Mark messages as read on mount or when conversation changes
  useEffect(() => {
    if (conversation.conversationId && currentUser.id) {
       ChatService.markAsRead(conversation.conversationId);
    }
  }, [conversation.conversationId, currentUser.id]);

  

  // Handle read receipts
  useEffect(() => {
    if (lastReadEvent && lastReadEvent.conversationId === conversation.conversationId) {
       if (lastReadEvent.userId !== currentUser.id) {
         queryClient.setQueryData(
           ['messages', currentUser.id, conversation.conversationId], 
           (oldData: {pages:{data:IMessage[]}[]}) => {
             if (!oldData) return oldData;
             return {
               ...oldData,
               pages: oldData.pages.map((page: {data:IMessage[]}) => ({
                 ...page,
                 data: (page.data || []).map((m: IMessage) => 
                   m.senderId === currentUser.id ? { ...m, isRead: true } : m
                 )
               }))
             };
           }
         );
       }
    }
  }, [lastReadEvent, conversation.conversationId, currentUser.id, queryClient]);

  const handleSendMessage = async (content: string, file?: File) => {
    try {
      if (file) {
         console.warn("File upload feature backend not fully implemented yet");
         toast.info("File upload feature backend not fully implemented yet");
         return; 
      }

      await ChatService.sendMessage({
        conversationId: conversation.conversationId,
        content,
        type: 'text',
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Unread marker state
  const [unreadMarkerId, setUnreadMarkerId] = useState<string | null>(null);
  const markerSetRef = useRef(false);

  // Reset marker when conversation changes
  useEffect(() => {
    setUnreadMarkerId(null);
    markerSetRef.current = false;
  }, [conversation.conversationId]);

  // Determine unread marker position on initial load
  useEffect(() => {
    if (messages.length > 0 && !markerSetRef.current) {
      const firstUnread = messages.find((m: IMessage) => !m.isRead && m.senderId !== currentUser.id);
      if (firstUnread) {
        setUnreadMarkerId((firstUnread.id || firstUnread._id) as string);
      }
      markerSetRef.current = true;
    }
  }, [messages, currentUser.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  const isTyping = typingUsers.length > 0;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-white sticky top-0 w-full z-10 flex-none dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="mr-2 p-1 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <div className="relative">
            {oppositeUser?.profilePicture ? (
              <img
                src={oppositeUser.profilePicture}
                alt={oppositeUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
            )}
            {isOnline && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 bg-green-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
               {oppositeUser?.name}
            </h3>
            {isTyping ? (
                 <span className="text-xs text-indigo-600 animate-pulse font-medium">Typing...</span>
            ) : (
                 isOnline ? (
                   <span className="text-xs text-green-500 font-medium">Online</span>
                 ) : (
                    currentUser.role === 'student' && conversation.instructor && (
                      <div className="flex items-center gap-1.5 mb-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        <span className="truncate">{conversation.instructor.jobTitle}</span>
                        <span className="text-gray-300 dark:text-gray-700 font-normal">|</span>
                        <span className="whitespace-nowrap">{conversation.instructor.experience} Exp</span>
                      </div>
                    )
                 )
            )}
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 cursor-pointer">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50"
        style={{scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent', }}
      >
        <div className="flex flex-col justify-end min-h-full">
            {/* Sentinel for infinite scroll */}
            <div ref={topSentinelRef} className="h-1" />
            
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              </div>
            )}

            {messages.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                </div>
            ) : (
              <div>
                {messages.map((message: IMessage) => (
                  <React.Fragment key={(message.id ) as string}>
                    {((message.id ) === unreadMarkerId) && (
                      <div className="w-full flex justify-center my-4">
                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                          Unread Messages
                        </span>
                      </div>
                    )}
                    <MessageBubble
                      message={{
                          id: (message.id || message._id) as string,
                          content: message.content,
                          senderRole: message.senderRole,
                          type: message.type,
                          fileUrl: message.fileUrl,
                          fileName: message.fileName,
                          createdAt: message.createdAt,
                          isRead: message.isRead
                        }}
                        isOwnMessage={message.senderId === currentUser.id}
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={sendTypingIndicator}
      />
    </div>
  );
};

export default ChatWindow;
