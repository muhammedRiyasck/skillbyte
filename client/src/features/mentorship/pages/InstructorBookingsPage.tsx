import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getInstructorBookings, cancelBooking } from "../services/mentorshipServices";
import type { IMentorshipBooking } from "../types/mentorshipTypes";
import { BookingCard } from "../components/BookingCard";

const InstructorBookingsPage = () => {
    const [bookings, setBookings] = useState<IMentorshipBooking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await getInstructorBookings();
            setBookings(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId: string) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                await cancelBooking(bookingId);
                toast.success("Booking cancelled");
                // Refresh or update local state
                setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'cancelled' } : b));
            } catch (error) {
                console.error(error);
                toast.error("Failed to cancel booking");
            }
        }
    };

    const handleJoinSession = (bookingId: string) => {
        // Find booking to get URL?
        const booking = bookings.find(b => b.bookingId === bookingId);
        if (booking?.videoRoomUrl) {
            window.open(booking.videoRoomUrl, '_blank');
        } else {
             toast.error("Video room not available yet");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="  pt-20 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mentorship Bookings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">View and manage your upcoming sessions.</p>
          </div>

             {loading ? (
                <div className="flex justify-center py-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No bookings found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookings.map(booking => (
                        <BookingCard 
                            key={booking.bookingId} 
                            booking={booking} 
                            onCancel={handleCancel}
                            onJoinSession={handleJoinSession}
                            userRole="instructor"
                        />
                    ))}
                </div>
            )}
        </div>
        </div>
    );
};

export default InstructorBookingsPage;
