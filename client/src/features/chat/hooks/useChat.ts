import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import type { ChatContextType } from '../context/ChatContext';

export const useChat = (): ChatContextType => useContext(ChatContext);
