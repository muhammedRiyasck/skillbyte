import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';
import { ROUTES } from '@core/router/paths';
import type { DashboardBooking } from '../../hooks/useInstructorDashboard';

interface UpcomingSessionsProps {
    itemVariants: Variants;
    bookings: DashboardBooking[];
}

const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ itemVariants, bookings }) => {
    return (
        <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden mb-10"
        >
            <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Upcoming Sessions</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">Your mentorship schedule</p>
                </div>
                <Link to={ROUTES.instructor.mentorship.bookings} className="text-indigo-600 font-black text-sm hover:underline">Full Schedule</Link>
            </div>
            <div className="p-8">
                {bookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map((booking) => (
                            <div key={booking.bookingId} className="group relative bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5">
                                <div className="flex items-center gap-4 mb-4">
                                    {booking.studentAvatar ? (
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                                            <img src={booking.studentAvatar} alt={booking.studentName || 'Student'} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="overflow-hidden">
                                        <p className="font-black text-slate-900 dark:text-white truncate">{booking.studentName || `Student #${booking?.studentId}`}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1 truncate">
                                            {booking.slotTitle ? `${booking.slotTitle} • Student` : 'Session Student'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                        {new Date(booking.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                        <Clock className="w-4 h-4 text-indigo-500" />
                                        {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {booking.slotDuration && (
                                            <span className="text-slate-400 dark:text-slate-500">
                                                {'→ '}
                                                {new Date(new Date(booking.scheduledAt).getTime() + booking.slotDuration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">({booking.slotDuration}m)</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {booking.videoRoomUrl ? (
                                    <a
                                        href={booking.videoRoomUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center bg-indigo-600 border border-indigo-600 py-3 rounded-2xl font-black text-sm text-white hover:bg-indigo-700 hover:border-indigo-700 transition-all shadow-md shadow-indigo-500/20"
                                    >
                                        Launch Video Call
                                    </a>
                                ) : (
                                    <Link
                                        to={ROUTES.instructor.mentorship.bookings}
                                        className="block w-full text-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 py-3 rounded-2xl font-black text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Manage Session
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400 font-bold flex flex-col items-center">
                        <Calendar className="w-12 h-12 mb-4 opacity-10" />
                        <p>No Upcoming Sessions</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default UpcomingSessions;
