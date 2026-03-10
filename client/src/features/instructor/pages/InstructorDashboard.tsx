import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    ArrowUpRight,
    Play,
    Clock,
    ExternalLink
} from 'lucide-react';
import { ROUTES } from '@core/router/paths';
import {
    getDashboardEarnings,
    getDashboardEnrollments,
    getDashboardBookings
} from '../services/InstructorDashboardService';
import Spiner from '@shared/ui/Spiner';
import { getStats } from '../constants/instructorDashboard';

interface DashboardEarnings {
    id: string;
    studentName: string;
    productName: string;
    instructorAmount: number;
    createdAt: string;
}

interface DashboardCourse {
    id: string;
    courseThumbnail: string;
    courseTitle: string;
    coursePrice: number;
    enrollments: { studentId: string }[];
}

interface DashboardBooking {
    bookingId: string;
    studentId: {
        name: string;
    };
    scheduledAt: string;
}

const InstructorDashboard: React.FC = () => {
    const { data: earningsData, isLoading: earningsLoading } = useQuery({
        queryKey: ['instructor-dashboard-earnings'],
        queryFn: getDashboardEarnings
    });

    const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
        queryKey: ['instructor-dashboard-enrollments'],
        queryFn: getDashboardEnrollments
    });

    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ['instructor-dashboard-bookings'],
        queryFn: getDashboardBookings
    });

    const isLoading = earningsLoading || enrollmentLoading || bookingsLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-800">
                <Spiner />
            </div>
        );
    }

    const earnings = earningsData?.data?.earnings || [];
    const totalProfit = earningsData?.data?.statistics?.totalProfit || 0;
    const totalStudents = enrollmentData?.data?.totalCount || 0;
    const courses = enrollmentData?.data?.data || [];
    const bookings = bookingsData?.data?.bookings || [];

    const stats = getStats(totalProfit, totalStudents, courses, bookings);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Instructor Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Overview of your teaching performance and schedule</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat) => (
                        <Link
                            key={stat.label}
                            to={stat.link}
                            className="bg-white dark:bg-gray-700 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-2xl`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{stat.value}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Earnings Section */}
                    <div className="bg-white dark:bg-gray-700 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Earnings</h2>
                            <Link to={ROUTES.instructor.earnings} className="text-blue-600 font-bold text-sm hover:underline">View All</Link>
                        </div>
                        <div className="p-2 overflow-x-auto">
                            {earnings.length > 0 ? (
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                                        {earnings.map((item: DashboardEarnings) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold uppercase text-xs">
                                                            {item.studentName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{item.studentName}</p>
                                                            <p className="text-xs text-gray-500">{item.productName}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-black text-green-600 dark:text-green-400">₹{item.instructorAmount}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-20 text-center text-gray-400 font-bold">No recent earnings</div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Bookings Section */}
                    <div className="bg-white dark:bg-gray-700 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upcoming Sessions</h2>
                            <Link to={ROUTES.instructor.mentorship.bookings} className="text-blue-600 font-bold text-sm hover:underline">View All</Link>
                        </div>
                        <div className="p-6">
                            {bookings.length > 0 ? (
                                <div className="space-y-4">
                                    {bookings.map((booking: DashboardBooking) => (
                                        <div key={booking.bookingId} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl text-teal-600">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">{booking.studentId.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(booking.scheduledAt).toLocaleDateString()} • {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                to={ROUTES.instructor.mentorship.bookings}
                                                className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-gray-400 font-bold">No sessions scheduled</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* My Courses Section */}
                <div className="mt-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Courses</h2>
                        <Link to={ROUTES.instructor.myCourses} className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                            Browse All <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.slice(0, 3).map((course: DashboardCourse) => (
                            <div key={course.id} className="bg-white dark:bg-gray-700 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-600 group">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={course.courseThumbnail}
                                        alt={course.courseTitle}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-gray-900 dark:text-gray-100">
                                        {course.enrollments.length} Students
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 line-clamp-1">{course.courseTitle}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">₹{course.coursePrice}</span>
                                        <Link
                                            to={ROUTES.instructor.myCourses}
                                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all"
                                        >
                                            Manage <Play className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {courses.length === 0 && (
                            <div className="col-span-full py-20 bg-white dark:bg-gray-700 rounded-[3rem] border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center">
                                <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
                                <p className="text-gray-400 font-bold text-lg">You haven't created any courses yet</p>
                                <Link to={ROUTES.instructor.createCourseBase} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                                    Create First Course
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
