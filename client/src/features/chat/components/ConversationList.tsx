import React, { useState, useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { format } from 'date-fns';
import { Search, User as UserIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { IConversation } from '../types/IConversation';
import type { User } from '@/features/auth';
import { useChat } from '../hooks/useChat';

interface ConversationListProps {
  currentUser: User;
  currentConversationId: string | undefined;
  onSelect: (conversation: IConversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  currentUser, 
  currentConversationId, 
  onSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { conversations, isLoading } = useChat();
  const { onlineUsers } = useContext(ChatContext);

  const filteredConversations = (conversations || []).filter((conv: IConversation) => {
    const oppositeUser = currentUser.role === 'student' ? conv.instructor : conv.student;
    const searchString = `${oppositeUser?.name || ''} ${conv.course?.title || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col fixed h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
       <div className="flex items-center gap-1 dark:text-white cursor-pointer ">
        <div onClick={() => navigate(-1)} className="flex items-center gap-1">
        <svg className="mb-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
         <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 cursor-pointer">Back</h2>
        </div>
       </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Messages</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none  focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 " />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No conversations found' : 'No messages yet'}
          </div>
        ) : (
          filteredConversations.map((conversation: IConversation) => {
            const isStudent = currentUser.role === 'student';
            const oppositeUser = isStudent ? conversation.instructor : conversation.student;

            if (!oppositeUser) return null;

            const isOnline = onlineUsers.has(oppositeUser.id);
            const unreadCount = isStudent ? conversation.unreadCount?.student : conversation.unreadCount?.instructor;
             // Format time
            const timeDisplay = conversation.lastMessage 
              ? format(new Date(conversation.lastMessage.timestamp), 'MMM d, h:mm a')
              : format(new Date(conversation.updatedAt), 'MMM d');

            return (
              <div
                key={conversation.conversationId}
                onClick={() => onSelect(conversation)}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 ${
                  currentConversationId === conversation.conversationId ? 'bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    {oppositeUser.profilePicture ? (
                      <img
                        src={oppositeUser.profilePicture}
                        alt={oppositeUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}
                    {unreadCount && unreadCount > 0 ? (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                        {unreadCount}
                      </span>
                    ) : null}
                     {isOnline && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-900 bg-green-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {oppositeUser.name}
                      </h3>
                      <span className="text-[11px] text-gray-500 whitespace-nowrap ml-2">
                        {timeDisplay}
                      </span>
                    </div>

                    {isStudent && conversation.instructor && (
                      <div className="flex items-center gap-1.5 mb-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        <span className="truncate">{conversation.instructor.jobTitle}</span>
                        <span className="text-gray-300 dark:text-gray-700 font-normal">|</span>
                        <span className="whitespace-nowrap">{conversation.instructor.experience} Exp</span>
                      </div>
                    )}

                    <p className={`text-sm truncate ${
                      unreadCount && unreadCount > 0 
                        ? 'font-semibold text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {conversation.lastMessage?.senderId === currentUser.id && (
                        <span className="text-gray-400 font-normal">You: </span>
                      )}
                        {conversation.lastMessage?.content || 'Started a conversation'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
