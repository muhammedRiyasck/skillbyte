import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Filter, RefreshCw, Calendar } from "lucide-react";
import { getInstructorBookings, cancelBooking, generateVideoRoom, rescheduleBooking } from "../services/BookingServices";
import type { IMentorshipBooking, InstructorBookingFilters } from "../types/mentorshipTypes";
import { BookingCard } from "../components/BookingCard";
import Modal from "@/shared/components/Modal";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/core/router/paths";
import { BookingStatus } from "../../../shared/enums/BookingStatus";
import { UserRole } from "../../../shared/enums/UserRole";

const InstructorBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<IMentorshipBooking[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState<InstructorBookingFilters>({
        page: 1,
        limit: 10,
    });
    const [hasMore, setHasMore] = useState(true);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [bookingToReschedule, setBookingToReschedule] = useState<IMentorshipBooking | null>(null);
    const [newDateTime, setNewDateTime] = useState('');
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [isRescheduling, setIsRescheduling] = useState(false);

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getInstructorBookings(filters);
            setBookings(data);

            if (data.length < (filters.limit || 10)) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchBookings();
    }, [filters, fetchBookings]);

    const handleFilterChange = (status: BookingStatus | 'all') => {
        setFilters(prev => {
            const newFilters: InstructorBookingFilters = {
                ...prev,
                page: 1
            };
            if (status === 'all') {
                delete newFilters.status;
            } else {
                newFilters.status = status;
            }
            return newFilters;
        });
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelClick = (bookingId: string) => {
        setBookingToCancel(bookingId);
        setIsConfirmOpen(true);
    };

    const confirmCancel = async () => {
        if (!bookingToCancel) return;
        try {
            setIsCancelling(true);
            await cancelBooking(bookingToCancel);
            toast.success("Booking cancelled");
            setBookings(prev => prev.map(b => b.bookingId === bookingToCancel ? { ...b, status: BookingStatus.CANCELLED } : b));
            setIsConfirmOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsCancelling(false);
            setBookingToCancel(null);
        }
    };

    const toLocalISOString = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleRescheduleClick = (booking: IMentorshipBooking) => {
        setBookingToReschedule(booking);
        const currentScheduled = new Date(booking.scheduledAt);
        const defaultDate = currentScheduled > new Date()
            ? currentScheduled
            : new Date(Date.now() + 60 * 60 * 1000);
        setNewDateTime(toLocalISOString(defaultDate));
        setRescheduleReason('');
        setIsRescheduleOpen(true);
    };

    const confirmReschedule = async () => {
        if (!bookingToReschedule || !newDateTime) return;
        const selectedDate = new Date(newDateTime);
        if (isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
            toast.error("Please choose a valid future date and time.");
            return;
        }

        try {
            setIsRescheduling(true);
            const trimmedReason = rescheduleReason.trim();
            const updated = await rescheduleBooking(bookingToReschedule.bookingId, {
                newScheduledAt: selectedDate.toISOString(),
                reason: trimmedReason ? trimmedReason : undefined,
            });
            toast.success("Session rescheduled and student notified via email.");
            setBookings(prev =>
                prev.map(b =>
                    b.bookingId === updated.bookingId
                        ? { ...b, scheduledAt: updated.scheduledAt }
                        : b
                )
            );
            setIsRescheduleOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsRescheduling(false);
        }
    };

    const handleJoinSession = async (bookingId: string) => {
        const booking = bookings.find(b => b.bookingId === bookingId);
        if (!booking) return;

        try {
            if (!booking.videoRoomUrl) {
                toast.loading("Generating your secure video room...");
                const { roomUrl, roomId } = await generateVideoRoom(bookingId);
                toast.dismiss();
                toast.success("Room ready!");
                setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, videoRoomUrl: roomUrl, videoRoomId: roomId } : b));
            }

            const roomId = booking.videoRoomId || booking.videoRoomUrl?.split('/').pop();
            if (roomId) {
                navigate(ROUTES.videoCall.replace(':roomId', roomId));
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to join video call");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Full-width Header aligned with Course Pages */}
            <div className="pt-10 sticky top-20 z-40 bg-gray-200 dark:bg-gray-700 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-indigo-600" />
                    Mentorship Bookings
                </h2>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-transparent shadow-sm rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                            value={filters.status || 'all'}
                            onChange={(e) => handleFilterChange(e.target.value as BookingStatus | 'all')}
                        >
                            <option value="all">All Status</option>
                            <option value={BookingStatus.PENDING}>Pending</option>
                            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                            <option value={BookingStatus.COMPLETED}>Completed</option>
                            <option value={BookingStatus.CANCELLED}>Cancelled</option>
                        </select>
                    </div>

                    <button
                        className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer"
                        title="Refresh data"
                        onClick={() => {
                            fetchBookings();
                            toast.success("Bookings Refreshed");
                        }}
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <Filter className="w-8 h-8 text-gray-400" />
                        </div>

                        {(filters.page || 1) <= 1 ? <><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Bookings Found</h3>
                            <p className="text-gray-500 max-w-md">
                                {filters.status
                                    ? `You don't have any ${filters.status} bookings. Try changing the filter.`
                                    : "You haven't received any bookings yet."}
                            </p></> : <p className="text-gray-500 max-w-md">Go Back To The Previous Page.<br />No More Bookings To Show.</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                        {bookings.map(booking => (
                            <BookingCard
                                key={booking.bookingId}
                                booking={booking}
                                onCancel={handleCancelClick}
                                onReschedule={handleRescheduleClick}
                                onJoinSession={handleJoinSession}
                                userRole={UserRole.INSTRUCTOR}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {((filters.page || 1) > 1 || hasMore) && (
                    <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => handlePageChange((filters.page || 1) - 1)}
                            disabled={(filters.page || 1) <= 1 || loading}
                            className={`flex items-center  gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${(filters.page || 1) <= 1
                                ? 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm cursor-pointer'
                                }`}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                            Page {filters.page || 1}
                        </span>

                        <button
                            onClick={() => handlePageChange((filters.page || 1) + 1)}
                            disabled={!hasMore || loading}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${!hasMore
                                ? 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm cursor-pointer'
                                }`}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => !isCancelling && setIsConfirmOpen(false)}
                title="Cancel Booking"
                onConfirm={confirmCancel}
                confirmLabel={isCancelling ? "Cancelling..." : "Yes, Cancel"}
                cancelLabel="Keep Booking"
            >
                <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400">
                        Are you sure you want to cancel this session?
                    </p>

                    {bookingToCancel && (() => {
                        const booking = bookings.find(b => b.bookingId === bookingToCancel);
                        if (booking && booking.amount > 0 && booking.status === BookingStatus.CONFIRMED) {
                            return (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                    <p className="font-semibold">The student will be fully refunded.</p>
                                    <p className="text-xs mt-1">Instructor cancellations automatically trigger the refund.</p>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    <p className="text-xs text-gray-500">
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>

            <Modal
                isOpen={isRescheduleOpen}
                onClose={() => !isRescheduling && setIsRescheduleOpen(false)}
                title="Reschedule Mentorship Session"
                onConfirm={confirmReschedule}
                confirmLabel={isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
                cancelLabel="Keep Current Time"
            >
                <div className="space-y-4">
                    {bookingToReschedule && (
                        <div className="p-3.5 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-200 dark:border-gray-700 text-sm">
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {typeof bookingToReschedule.slotId === 'object' && bookingToReschedule.slotId?.title
                                    ? bookingToReschedule.slotId.title
                                    : 'Mentorship Session'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Student: <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {typeof bookingToReschedule.studentId === 'object' ? bookingToReschedule.studentId.name : 'Student'}
                                </span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Current scheduled time: <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {new Date(bookingToReschedule.scheduledAt).toLocaleString()}
                                </span>
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Date & Time <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={newDateTime}
                            min={toLocalISOString(new Date(Date.now() + 5 * 60 * 1000))}
                            onChange={(e) => setNewDateTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Must not conflict with any of your other active slots or booked sessions.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason / Note for Student <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            value={rescheduleReason}
                            onChange={(e) => setRescheduleReason(e.target.value)}
                            rows={3}
                            placeholder="Explain why this session is being rescheduled..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                        />
                    </div>

                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-lg text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>An email notification with the updated schedule and join links will be automatically sent to the student.</span>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default InstructorBookingsPage;
