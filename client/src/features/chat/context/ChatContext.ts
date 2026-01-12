import { createContext } from 'react';
import type { IMessage } from '../types/IMessage';
import type { IConversation } from '../types/IConversation';

export interface ChatContextType {
  lastGlobalMessage: IMessage | null;
  conversations: IConversation[];
  totalUnreadCount: number;
  isLoading: boolean;
  onlineUsers: Set<string>;
  checkOnlineStatus: (userIds: string[]) => void;
}

export const ChatContext = createContext<ChatContextType>({
  lastGlobalMessage: null,
  conversations: [],
  totalUnreadCount: 0,
  isLoading: false,
  onlineUsers: new Set(),
  checkOnlineStatus: () => {},
});
