import React, { useEffect, useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Bell, Check, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationPage: React.FC = () => {
    const { 
        notifications, 
        unreadCount, 
        page, 
        setPage, 
        totalPages, 
        isLoading, 
        handleMarkAsRead, 
        handleMarkAllAsRead 
    } = useNotifications();

    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


   return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 pt-6">

            {/* Glass Sticky Header */}
            <div className="sticky top-0  z-50 w-full">
                <div
                    className={`max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center rounded-xl transition-all duration-300
                    backdrop-blur-lg bg-white/70 dark:bg-gray-900/70
                    border border-gray-200/60 dark:border-gray-700/60
                    ${isScrolled ? "shadow-lg" : "shadow-none"}
                    `}
                >
                    {/* Back Button */}
                    <button
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition cursor-pointer"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Title */}
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Bell className="w-7 h-7 text-indigo-600 animate-pulse  " />
                        Notifications ({page})
                        {unreadCount > 0 && (
                            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>

                    {/* Mark All Button */}
                    <div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all cursor-pointer text-sm"
                            >
                                <CheckCheck className="w-5 h-5" />
                                <span className="hidden sm:inline">
                                    Mark all read
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 mt-8">

                {isLoading && notifications.length === 0 ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center my-24 py-20 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                            No notifications
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            We'll notify you when something important happens.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 transition-colors flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                                        !notification.isRead
                                            ? 'bg-indigo-50/40 dark:bg-indigo-900/10'
                                            : ''
                                    }`}
                                >
                                    <div
                                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                            notification.type === 'success'
                                                ? 'bg-green-100 text-green-600'
                                                : notification.type === 'error'
                                                ? 'bg-red-100 text-red-600'
                                                : notification.type === 'warning'
                                                ? 'bg-yellow-100 text-yellow-600'
                                                : 'bg-blue-100 text-blue-600'
                                        }`}
                                    >
                                        <Bell className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3
                                                className={`font-semibold ${
                                                    !notification.isRead
                                                        ? 'text-gray-900 dark:text-white'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatDistanceToNow(
                                                    new Date(notification.createdAt),
                                                    { addSuffix: true }
                                                )}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                            {notification.message}
                                        </p>

                                        {!notification.isRead && (
                                            <button
                                                onClick={() =>
                                                    handleMarkAsRead(notification.id)
                                                }
                                                className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                                            >
                                                <Check className="w-4 h-4" /> Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center items-center gap-4">
                                <button
                                    onClick={() =>
                                        setPage(prev => Math.max(prev - 1, 1))
                                    }
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    onClick={() =>
                                        setPage(prev =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default NotificationPage;
