import { createContext } from 'react';
import type { Notification } from '../services/NotificationService';

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    handleMarkAsRead: (id: string) => Promise<void>;
    handleMarkAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
