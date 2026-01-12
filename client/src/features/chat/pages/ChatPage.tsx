import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useSelector } from 'react-redux';
import { MessageSquare } from 'lucide-react';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import type { RootState } from '@/core/store/Index';
import type { IConversation } from '../types/IConversation';


const ChatPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth); 
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null); 
  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversationId');

  const { conversations } = useChat();

  // Handle URL-based conversation selection
  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0) {
      const found = conversations.find((c: IConversation) => c.conversationId === conversationIdFromUrl);
      if (found) {
        setSelectedConversation(found);
      }
    }
  }, [conversationIdFromUrl, conversations]);

  // Reset selection when user changes (login/logout)
  useEffect(() => {
    setSelectedConversation(null);
  }, [user?.id]);

  // Mobile view state: if selectedConversation is null, show list. if not null, show window.
  
  if (!user) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
            <p className="text-gray-500">Please log in to view messages.</p>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"> 
      
      {/* Conversation List - Hidden on mobile if conversation is selected */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${
        selectedConversation ? 'hidden md:block' : 'block'
      }`}>
        <ConversationList 
          currentUser={user}
          currentConversationId={selectedConversation?.conversationId}
          onSelect={(conv) => setSelectedConversation(conv)}
        />
      </div>

      {/* Chat Window - Hidden on mobile if no conversation selected */}
      <div className={`flex-1 flex flex-col h-full min-h-0 bg-gray-50 dark:bg-gray-950 ${
        !selectedConversation ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedConversation ? (
          <ChatWindow
            currentUser={user}
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Select a conversation
            </h2>
            <p className="text-center max-w-sm">
              Choose a person from the left to start chatting or check your messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
