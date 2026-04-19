import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { getStudentBookings, cancelBooking, generateVideoRoom } from "../services/BookingServices";
import { getMySessionRatings } from "../../review/services/ReviewService";
import type { IMentorshipBooking, StudentBookingFilters } from "../types/mentorshipTypes";
import { BookingCard } from "../components/BookingCard";
import { Calendar, RefreshCw, Filter } from "lucide-react";
import { ROUTES } from "@/core/router/paths";
import { useNavigate } from "react-router-dom";
import Modal from "@shared/ui/Modal";
import { BookingStatus } from "../../../shared/enums/BookingStatus";
import { UserRole } from "../../../shared/enums/UserRole";
import ReviewForm from "@features/review/components/ReviewForm";

const ITEMS_PER_PAGE = 10;

const StudentBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<IMentorshipBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    // Load persisted ratings from localStorage
    const [userRatings, setUserRatings] = useState<Record<string, number>>(() => {
        try {
            const saved = localStorage.getItem('student_session_ratings');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    
    const observer = useRef<IntersectionObserver | null>(null);

    // Confirmation Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cantRefund, setCantRefund] = useState(false)

    // Review Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [bookingToReview, setBookingToReview] = useState<string | null>(null);

    const lastBookingElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchBookings = async (pageNum: number, isRefresh: boolean = false, activeStatus: string = 'all') => {
        try {
            setLoading(true);
            const filters: StudentBookingFilters = {
                page: pageNum,
                limit: ITEMS_PER_PAGE,
            };
            if (activeStatus !== 'all') {
                filters.status = activeStatus as BookingStatus;
            }

            const data = await getStudentBookings(filters);

            if (isRefresh) {
                setBookings(data);
                setHasMore(data.length === ITEMS_PER_PAGE);
            } else {
                setBookings(prev => {
                    const newBookings = data.filter(
                        newB => !prev.some(oldB => oldB.bookingId === newB.bookingId)
                    );
                    return [...prev, ...newBookings];
                });
                if (data.length < ITEMS_PER_PAGE) {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const refreshBookings = useCallback(() => {
        if (page === 1) {
            fetchBookings(1, true, statusFilter);
        } else {
            setPage(1);
            setHasMore(true);
        }
    }, [page, statusFilter]);

    const handlePayPalCapture = useCallback(async (orderId: string) => {
        try {
            toast.loading("Confirming your booking...");
            const { capturePayPalPayment } = await import("@features/enrollment/services/EnrollmentService");
            const result = await capturePayPalPayment(orderId);
            toast.dismiss();

            if (result.success) {
                toast.success("Mentorship booking confirmed!");
                refreshBookings();
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            toast.dismiss();
            console.error(error);
        }
    }, [refreshBookings]);
    
    // Fetch ratings from server on mount
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const ratings = await getMySessionRatings();
                setUserRatings(prev => {
                    const next = { ...prev, ...ratings };
                    localStorage.setItem('student_session_ratings', JSON.stringify(next));
                    return next;
                });
            } catch (error) {
                console.error("Failed to fetch session ratings:", error);
            }
        };
        fetchRatings();
    }, []);

    useEffect(() => {
        fetchBookings(page, page === 1, statusFilter);

        // Handle PayPal return on initial mount
        if (page === 1) {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            if (token) {
                handlePayPalCapture(token);
            }
        }
    }, [page, statusFilter, handlePayPalCapture]);

    const handleStatusChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        setPage(1);
        setHasMore(true);
    };

    const handleCancelClick = (bookingId: string) => {
        const booking = bookings.find(b => b.bookingId === bookingId);
        if (!booking) return;

        setBookingToCancel(bookingId);

        if (booking.amount > 0 && booking.status === BookingStatus.CONFIRMED) {
            const scheduledDate = new Date(booking.scheduledAt);
            const now = new Date();
            const hoursDiff = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursDiff <= 24) {
                setCantRefund(true);
                setIsConfirmOpen(false);
                return;
            }
        }

        setCantRefund(false);
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

    const handleJoinSession = async (bookingId: string) => {
        const booking = bookings.find(b => b.bookingId === bookingId);
        if (!booking) return;

        try {
            // Generate video room if not exists
            if (!booking.videoRoomUrl) {
                toast.loading("Preparing video room...");
                const { roomUrl, roomId } = await generateVideoRoom(bookingId);
                toast.dismiss();
                setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, videoRoomUrl: roomUrl, videoRoomId: roomId } : b));
            }

            // Extract roomId from videoRoomUrl (format: /video-call/{roomId})
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

    const handleRateClick = (bookingId: string) => {
        setBookingToReview(bookingId);
        setIsReviewOpen(true);
    };

    const selectedBooking = bookings.find(b => b.bookingId === bookingToCancel);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pb-8">
            <div className="lg:sticky top-0 z-10 bg-white dark:bg-gray-900 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="bg-gray-100 dark:bg-gray-800 shadow-sm px-6 py-6 flex flex-col md:flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700 lg:mb-4 gap-4">
                    <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                        My Bookings
                    </h1>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 md:flex-none">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-gray-400" />
                            </div>
                            <select
                                className="w-full md:w-48 pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white appearance-none cursor-pointer hover:border-indigo-300 transition-colors shadow-sm"
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value={BookingStatus.PENDING}>Pending</option>
                                <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                                <option value={BookingStatus.CANCELLED}>Cancelled</option>
                                <option value={BookingStatus.COMPLETED}>Completed</option>
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                refreshBookings();
                                toast.success("Bookings refreshed");
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">

                {initialLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-4">
                            <Filter className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                            {statusFilter !== 'all'
                                ? `No ${statusFilter} bookings found.`
                                : "You haven't booked any sessions yet."}
                        </p>
                        {statusFilter === 'all' && (
                            <button
                                onClick={() => navigate(ROUTES.student.mentorship.browse)}
                                className="mt-4 text-indigo-600 cursor-pointer font-medium hover:underline"
                            >
                                Browse Instructors
                            </button>
                        )}
                        {statusFilter !== 'all' && (
                            <button
                                onClick={() => handleStatusChange('all')}
                                className="mt-4 text-indigo-600 cursor-pointer font-medium hover:underline"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                            {bookings.map((booking, index) => {
                                if (bookings.length === index + 1) {
                                    return (
                                        <div ref={lastBookingElementRef} key={booking.bookingId}>
                                            <BookingCard
                                                booking={booking}
                                                onCancel={handleCancelClick}
                                                onJoinSession={handleJoinSession}
                                                onRate={handleRateClick}
                                                userRole={UserRole.STUDENT}
                                                existingRating={userRatings[booking.bookingId]}
                                            />
                                        </div>
                                    );
                                } else {
                                    return (
                                        <BookingCard
                                            key={booking.bookingId}
                                            booking={booking}
                                            onCancel={handleCancelClick}
                                            onJoinSession={handleJoinSession}
                                            onRate={handleRateClick}
                                            userRole={UserRole.STUDENT}
                                            existingRating={userRatings[booking.bookingId]}
                                        />
                                    );
                                }
                            })}
                        </div>
                        {loading && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        )}
                        {!hasMore && bookings.length > 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No more bookings to load.
                            </div>
                        )}
                    </>
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
                        Are you sure you want to cancel this mentorship session?
                    </p>

                    {selectedBooking?.amount && selectedBooking.amount > 0 && selectedBooking.status === BookingStatus.CONFIRMED ? (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
                            <p className="font-semibold">You are eligible for a full refund.</p>
                            <p className="text-xs mt-1">Cancellation is more than 24 hours before the session.</p>
                        </div>
                    ) : null}

                    <p className="text-xs text-gray-500">
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>

            <Modal
                isOpen={cantRefund}
                onClose={() => setCantRefund(false)}
                title="No Refund"
                onConfirm={() => setCantRefund(false)}
                confirmLabel="Understood"
                cancelLabel="Close"
            >
                <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                        <p className="font-semibold">No refund will be issued.</p>
                        <p className="text-xs mt-1">Cancellation is within 24 hours of the session start time.</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-semibold">No further action is required at this time.</p>
                        <p className="text-sm mt-1">
                            No changes were made due to the cancellation timing.
                        </p>
                    </div>
                </div>

            </Modal>

            {/* Review Model */}
            <Modal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                title="Rate Mentorship Session"
            >
                <div className="pt-2">
                    {bookingToReview && (
                        <ReviewForm
                            targetType="session"
                            targetId={bookingToReview}
                            onSuccess={(rating) => {
                                setUserRatings(prev => {
                                    const next = { ...prev, [bookingToReview]: rating };
                                    localStorage.setItem('student_session_ratings', JSON.stringify(next));
                                    return next;
                                });
                                setIsReviewOpen(false);
                            }}
                            onCancel={() => setIsReviewOpen(false)}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default StudentBookingsPage;
