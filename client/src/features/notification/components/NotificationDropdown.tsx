import { useEffect, useState, useRef } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../core/router/paths';
import { sendTestNotification } from '../services/NotificationService';

const NotificationDropdown = () => {
    const { 
        notifications, 
        unreadCount, 
        isLoading, 
        handleMarkAsRead, 
        handleMarkAllAsRead,
        refreshNotifications
    } = useNotifications();
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            refreshNotifications();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, refreshNotifications]);

    const handleSendTest = async () => {
        try {
            await sendTestNotification();
            // Notification will be received via socket and added to context state
        } catch (error) {
            console.error('Failed to send test notification', error);
        }
    };

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown}
                className={`relative p-2 cursor-pointer text-gray-600 hover:bg-gray-100 rounded-full dark:text-gray-300 dark:hover:bg-gray-800 transition-colors ${unreadCount > 0 ? 'bg-indigo-50/50 dark:bg-indigo-900/20 animate-bounce' : ''}`}
                type="button"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                   <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                   </div>

                   <div className="max-h-[400px] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                {notifications.map((notification) => (
                                    <li 
                                        key={notification.id} 
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notification.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {notification.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <span className="text-xs text-gray-400 mt-2 block">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            {!notification.isRead && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                    className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 cursor-pointer"
                                                    title="Mark as read"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                   </div>
                   
                   <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-4">
                        <button onClick={handleSendTest} className="text-xs cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            Test Notification
                        </button>
                        <Link to={ROUTES.notifications} onClick={() => setIsOpen(false)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                            View all
                        </Link>
                   </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
