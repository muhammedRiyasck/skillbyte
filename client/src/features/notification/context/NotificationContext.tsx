import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
} from '../services/NotificationService';
import { toast } from 'sonner';
import { NotificationContext } from './NotificationContextTypes';
import type { Notification } from '../services/NotificationService';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const { socket } = useSocket();

    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getUserNotifications(page, 10);
            if (response.success && response.data) {
                setNotifications(response.data.notifications);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            toast.error('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    const refreshNotifications = useCallback(async () => {
        try {
            const response = await getUserNotifications(1, 10);
            if (response.success && response.data) {
                setNotifications(response.data.notifications);
                setPage(1);
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error('Failed to refresh notifications', error);
        }
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read', error);
            toast.error('Failed to update notification');
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
             console.error('Failed to mark all as read', error);
             toast.error('Failed to update notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (newNotification: Notification) => {
            if (page === 1) {
                setNotifications(prev => [newNotification, ...prev]);
            }
            
            // Show toast
            const message = newNotification.message;
            const description = newNotification.title;
            
            switch (newNotification.type) {
                case 'success':
                    toast.success(message, { description });
                    break;
                case 'error':
                    toast.error(message, { description });
                    break;
                case 'warning':
                    toast.warning(message, { description });
                    break;
                default:
                    toast(message, { description });
            }
        };

        socket.on('notification', handleNewNotification);

        return () => {
            socket.off('notification', handleNewNotification);
        };
    }, [socket, page]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            page,
            setPage,
            totalPages,
            isLoading,
            fetchNotifications,
            handleMarkAsRead,
            handleMarkAllAsRead,
            refreshNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
