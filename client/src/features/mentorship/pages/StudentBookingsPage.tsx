import { useState, useEffect, useRef, useCallback } from "react";
import {motion} from 'framer-motion'
import { toast } from "sonner";
import { getStudentBookings, cancelBooking, generateVideoRoom, getResumePaymentSecret } from "../services/BookingServices";
import { getMySessionRatings, type ISessionReview } from "../../review/services/ReviewService";
import type { IMentorshipBooking, StudentBookingFilters } from "../types/mentorshipTypes";
import { BookingCard } from "../components/BookingCard";
import { RefreshCw, Filter } from "lucide-react";
import { ROUTES } from "@/core/router/paths";
import { useNavigate } from "react-router-dom";
import Modal from "@shared/ui/Modal";
import { BookingStatus } from "../../../shared/enums/BookingStatus";
import { UserRole } from "../../../shared/enums/UserRole";
import ReviewForm from "@features/review/components/ReviewForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { MentorshipCheckoutForm } from "../components/MentorshipCheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const ITEMS_PER_PAGE = 10;

const StudentBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<IMentorshipBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    

    const [userRatings, setUserRatings] = useState<Record<string, number | ISessionReview>>(() => {
        try {
            const saved = localStorage.getItem('student_session_ratings');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    
    const observer = useRef<IntersectionObserver | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cantRefund, setCantRefund] = useState(false)

    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [bookingToReview, setBookingToReview] = useState<string | null>(null);

    const [resumeClientSecret, setResumeClientSecret] = useState<string | null>(null);
    const [isResumingPayment, setIsResumingPayment] = useState(false);

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

    const fetchBookings = useCallback(async (pageNum: number, isRefresh: boolean = false, activeStatus: string = 'all') => {
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
    }, []);

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
    }, [page, statusFilter, fetchBookings]);

    const handlePayPalCapture = useCallback(async (orderId: string) => {
        try {
            toast.loading("Confirming your booking...");
            const { capturePayPalPayment } = await import("@features/enrollment/services/EnrollmentService");
            const result = await capturePayPalPayment(orderId);
            toast.dismiss();

            if (result.success) {
                toast.success("Mentorship booking confirmed!");
                refreshBookings();
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (error) {
            toast.dismiss();
            console.error(error);
        }
    }, [refreshBookings]);
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
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            handlePayPalCapture(token);
        }
    }, [handlePayPalCapture]);

    useEffect(() => {
        fetchBookings(page, page === 1, statusFilter);
    }, [page, statusFilter, fetchBookings]);

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
            if (!booking.videoRoomUrl) {
                toast.loading("Preparing video room...");
                const { roomUrl, roomId } = await generateVideoRoom(bookingId);
                toast.dismiss();
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

    const handleRateClick = (bookingId: string) => {
        setBookingToReview(bookingId);
        setIsReviewOpen(true);
    };

    const handleResumePayment = async (bookingId: string) => {
        try {
            setIsResumingPayment(true);
            const { clientSecret } = await getResumePaymentSecret(bookingId);
            setResumeClientSecret(clientSecret);
        } catch (error) {
            console.error(error);
        } finally {
            setIsResumingPayment(false);
        }
    };

    const selectedBooking = bookings.find(b => b.bookingId === bookingToCancel);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050914] text-gray-900 dark:text-white pb-10">

        {/* =========================================================
            HEADER
        ========================================================= */}
        <div className="lg:sticky lg:top-0 z-20 bg-white/95 dark:bg-[#050914]/95 backdrop-blur-xl">

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-5 lg:pt-6">

                <div className="flex items-center justify-between gap-3 mb-5">

                    {/* Title */}
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-1">
                            Mentorship
                        </p>

                        <motion.h1 initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="text-2xl
                                sm:text-3xl
                                md:text-4xl
                                font-bold
                                tracking-tight
                                text-gray-950
                                dark:text-white
                                flex
                                items-center
                                gap-3"
                        >
                            <span>My Bookings</span>
                        </motion.h1>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">

                        {/* Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

                            <select
                                className="
                                    w-36 sm:w-48
                                    appearance-none
                                    pl-9 pr-4 h-10
                                    rounded-xl
                                    border border-gray-200 dark:border-gray-800
                                    bg-white dark:bg-[#0b1220]
                                    text-sm font-medium
                                    text-gray-700 dark:text-gray-200
                                    outline-none
                                    cursor-pointer
                                    transition-all duration-200
                                    hover:border-gray-300 dark:hover:border-gray-700
                                    focus:border-blue-500
                                    focus:ring-2 focus:ring-blue-500/10
                                "
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

                        {/* Refresh */}
                        <button
                            onClick={() => {
                                refreshBookings();
                                toast.success("Bookings refreshed");
                            }}
                            className="
                                shrink-0
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                h-10
                                px-3
                                sm:px-4
                                rounded-xl
                                border
                                border-gray-200
                                dark:border-gray-800
                                bg-white
                                dark:bg-[#0b1220]
                                text-sm
                                font-medium
                                text-gray-700
                                dark:text-gray-200
                                shadow-sm
                                hover:bg-gray-50
                                dark:hover:bg-gray-800
                                hover:border-gray-300
                                dark:hover:border-gray-700
                                hover:shadow-md
                                transition-all
                                duration-300
                                cursor-pointer
                            "
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Bottom border */}
                <div className="border-b border-gray-200 dark:border-gray-800" />
            </div>
        </div>


        {/* =========================================================
            CONTENT
        ========================================================= */}
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">

            {initialLoading ? (

                /* =====================================================
                   INITIAL LOADING
                ===================================================== */
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="
                        min-h-[280px]
                        flex flex-col items-center justify-center
                        rounded-2xl
                        border border-gray-200 dark:border-gray-800
                        bg-white dark:bg-[#0b1220]
                    "
                >
                    <div className="relative">
                        <div className="
                            h-10 w-10
                            rounded-full
                            border-2
                            border-gray-200 dark:border-gray-700
                            border-t-blue-600 dark:border-t-blue-400
                            animate-spin"/>

                        <div className="
                            absolute inset-0
                            rounded-full
                            bg-blue-500/10
                            blur-xl
                        " />
                    </div>

                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Loading your bookings...
                    </p>
                </motion.div>

            ) : bookings.length === 0 ? (

                /* =====================================================
                   EMPTY STATE
                ===================================================== */
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="
                        relative
                        overflow-hidden
                        rounded-2xl
                        border border-gray-200 dark:border-gray-800
                        bg-white dark:bg-[#0b1220]
                        px-6 py-16 sm:py-20
                        text-center
                    "
                >
                    {/* Subtle background glow */}
                    <div className="
                        absolute
                        -top-32
                        left-1/2
                        -translate-x-1/2
                        h-64 w-64
                        rounded-full
                        bg-blue-500/10
                        blur-[100px]
                        pointer-events-none
                    " />

                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            duration: 0.4,
                            delay: 0.1,
                        }}
                        className="
                            relative
                            mx-auto mb-6
                            flex h-16 w-16
                            items-center justify-center
                            rounded-2xl
                            bg-blue-50 dark:bg-blue-500/10
                            border border-blue-100 dark:border-blue-500/20
                        "
                    >
                        <Filter className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </motion.div>

                    <div className="relative">
                        <h2 className="text-xl font-bold text-gray-950 dark:text-white">
                            {statusFilter !== "all"
                                ? `No ${statusFilter} bookings`
                                : "No bookings yet"}
                        </h2>

                        <p className="mt-2 max-w-md mx-auto text-sm leading-6 text-gray-500 dark:text-gray-400">
                            {statusFilter !== "all"
                                ? `There are no ${statusFilter} mentorship bookings matching your current filter.`
                                : "Book a session with an instructor and get personalized guidance for your learning journey."}
                        </p>

                        {statusFilter === "all" && (
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                    navigate(
                                        ROUTES.student.mentorship.browse
                                    )
                                }
                                className="
                                    mt-7
                                    inline-flex items-center justify-center
                                    rounded-xl
                                    bg-blue-600 hover:bg-blue-700
                                    px-5 py-2.5
                                    text-sm font-semibold
                                    text-white
                                    shadow-sm hover:shadow-md
                                    transition-all duration-200
                                    cursor-pointer
                                "
                            >
                                Browse Instructors
                            </motion.button>
                        )}

                        {statusFilter !== "all" && (
                            <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                    handleStatusChange("all")
                                }
                                className="
                                    mt-7
                                    inline-flex items-center justify-center
                                    rounded-xl
                                    border border-gray-200 dark:border-gray-700
                                    bg-white dark:bg-[#101827]
                                    px-5 py-2.5
                                    text-sm font-semibold
                                    text-gray-700 dark:text-gray-200
                                    hover:border-blue-300
                                    hover:text-blue-600
                                    dark:hover:text-blue-400
                                    transition-all duration-200
                                    cursor-pointer
                                "
                            >
                                Clear Filters
                            </motion.button>
                        )}
                    </div>
                </motion.div>

            ) : (

                /* =====================================================
                   BOOKINGS
                ===================================================== */
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {bookings.map((booking, index) => {
                            const isLast = bookings.length === index + 1;

                            return (
                                <motion.div
                                    key={booking.bookingId}
                                    ref={isLast ? lastBookingElementRef : undefined}
                                    initial={{
                                        opacity: 0,
                                        y: 12,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: "easeOut",
                                        delay: index * 0.1,
                                    }}
                                    whileHover={{
                                        y: -4,
                                    }}
                                    className="h-full flex flex-col"
                                >
                                    <BookingCard
                                        booking={booking}
                                        onCancel={handleCancelClick}
                                        onJoinSession={handleJoinSession}
                                        onRate={handleRateClick}
                                        onResumePayment={handleResumePayment}
                                        userRole={UserRole.STUDENT}
                                        existingRating={
                                            userRatings[booking.bookingId]
                                        }
                                    />
                                </motion.div>
                            );
                        })}
                    </div>


                    {/* =================================================
                        LOAD MORE
                    ================================================= */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-center py-8"
                        >
                            <div className="
                                h-8 w-8
                                rounded-full
                                border-2
                                border-gray-200 dark:border-gray-700
                                border-t-blue-600 dark:border-t-blue-400
                                animate-spin
                            " />
                        </motion.div>
                    )}


                    {/* =================================================
                        END OF LIST
                    ================================================= */}
                    {!hasMore && bookings.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="
                                flex items-center justify-center gap-3
                                py-8
                            "
                        >
                            <div className="h-px w-16 bg-gray-200 dark:bg-gray-800" />

                            <span className="
                                text-xs
                                font-medium
                                text-gray-400 dark:text-gray-500
                            ">
                                No more bookings
                            </span>

                            <div className="h-px w-16 bg-gray-200 dark:bg-gray-800" />
                        </motion.div>
                    )}
                </>
            )}
        </main>


        {/* =============================================================
            CANCEL BOOKING MODAL
        ============================================================= */}
        <Modal
            isOpen={isConfirmOpen}
            onClose={() =>
                !isCancelling && setIsConfirmOpen(false)
            }
            title="Cancel Booking"
            onConfirm={confirmCancel}
            confirmLabel={
                isCancelling ? "Cancelling..." : "Yes, Cancel"
            }
            cancelLabel="Keep Booking"
        >
            <div className="space-y-4">

                <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Are you sure you want to cancel this mentorship session?
                </p>

                {selectedBooking?.amount &&
                selectedBooking.amount > 0 &&
                selectedBooking.status === BookingStatus.CONFIRMED ? (
                    <div className="
                        p-4
                        rounded-xl
                        bg-green-50 dark:bg-green-500/10
                        border border-green-200 dark:border-green-500/20
                        text-sm
                        text-green-700 dark:text-green-400
                    ">
                        <p className="font-semibold">
                            You are eligible for a full refund.
                        </p>

                        <p className="text-xs mt-1.5 opacity-80">
                            Cancellation is more than 24 hours before
                            the session.
                        </p>
                    </div>
                ) : null}

                <p className="text-xs text-gray-500 dark:text-gray-500">
                    This action cannot be undone.
                </p>
            </div>
        </Modal>


        {/* =============================================================
            NO REFUND MODAL
        ============================================================= */}
        <Modal
            isOpen={cantRefund}
            onClose={() => setCantRefund(false)}
            title="No Refund"
            onConfirm={() => setCantRefund(false)}
            confirmLabel="Understood"
            cancelLabel="Close"
        >
            <div className="space-y-4">

                <div className="
                    p-4
                    rounded-xl
                    bg-amber-50 dark:bg-amber-500/10
                    border border-amber-200 dark:border-amber-500/20
                    text-sm
                    text-amber-700 dark:text-amber-400
                ">
                    <p className="font-semibold">
                        No refund will be issued.
                    </p>

                    <p className="text-xs mt-1.5 opacity-80">
                        Cancellation is within 24 hours of the
                        session start time.
                    </p>
                </div>

                <div className="
                    p-4
                    rounded-xl
                    bg-gray-50 dark:bg-[#101827]
                    border border-gray-200 dark:border-gray-800
                    text-sm
                    text-gray-700 dark:text-gray-300
                ">
                    <p className="font-semibold">
                        No further action is required at this time.
                    </p>

                    <p className="text-sm mt-1.5 text-gray-500 dark:text-gray-400">
                        No changes were made due to the cancellation timing.
                    </p>
                </div>
            </div>
        </Modal>


        {/* =============================================================
            REVIEW MODAL
        ============================================================= */}
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

                            setUserRatings((prev) => {
                                const next = {
                                    ...prev,
                                    [bookingToReview]: { rating },
                                };

                                localStorage.setItem(
                                    "student_session_ratings",
                                    JSON.stringify(next)
                                );

                                return next;
                            });

                            refreshBookings();
                            setIsReviewOpen(false);
                        }}
                        onCancel={() => setIsReviewOpen(false)}
                    />
                )}
            </div>
        </Modal>


        {/* =============================================================
            RESUME PAYMENT MODAL
        ============================================================= */}
        {resumeClientSecret && (
            <Modal
                isOpen={!!resumeClientSecret}
                onClose={() => setResumeClientSecret(null)}
                title="Complete Payment"
            >
                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret: resumeClientSecret,
                    }}
                >
                    <MentorshipCheckoutForm
                        onSuccess={() => {
                            toast.success("Booking confirmed!");
                            setResumeClientSecret(null);
                            refreshBookings();
                        }}
                    />
                </Elements>
            </Modal>
        )}


        {/* =============================================================
            PAYMENT LOADING TOAST
        ============================================================= */}
        {isResumingPayment && (
            <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.96 }}
                className="
                    fixed
                    bottom-5 right-5
                    z-50
                    flex items-center gap-3
                    rounded-xl
                    border border-blue-400/20
                    bg-[#0b1220]
                    px-4 py-3
                    text-sm font-medium
                    text-white
                    shadow-xl shadow-black/20
                "
            >
                <div className="
                    h-4 w-4
                    rounded-full
                    border-2
                    border-gray-600
                    border-t-blue-400
                    animate-spin
                " />

                Loading payment details...
            </motion.div>
        )}
    </div>
);
};

export default StudentBookingsPage;
