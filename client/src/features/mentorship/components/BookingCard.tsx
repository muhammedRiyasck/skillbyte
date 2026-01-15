import type { IMentorshipBooking } from "../types/mentorshipTypes";
import { format } from "date-fns";
import { Calendar, Clock, Video, User } from "lucide-react";

interface BookingCardProps {
  booking: IMentorshipBooking;
  onJoinSession?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  userRole: 'instructor' | 'student';
}

export const BookingCard = ({ booking, onJoinSession, onCancel, userRole }: BookingCardProps) => {
  const isConfirmed = booking.status === 'confirmed';
  const isPending = booking.status === 'pending';
  const isCancelled = booking.status === 'cancelled';
  const isCompleted = booking.status === 'completed';

  const scheduledDate = new Date(booking.scheduledAt);
  

  const otherParty = userRole === 'instructor' 
    ? (typeof booking.studentId === 'object' ? booking.studentId : { name: 'Student', profileImageUrl: '' })
    : (typeof booking.instructorId === 'object' ? booking.instructorId : { name: 'Instructor', profileImageUrl: '' });

  const statusColors: Record<IMentorshipBooking['status'], string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
           {/* Avatar */}
           <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {otherParty.profileImageUrl ? (
                  <img src={otherParty.profileImageUrl} alt={otherParty.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                  <User size={20} />
              )}
           </div>
           <div>
               <h4 className="font-semibold text-gray-900 dark:text-white">{otherParty.name}</h4>
               <p className="text-xs text-gray-500 capitalize">{userRole === 'student' ? (otherParty as { jobTitle: string }).jobTitle : 'Student'}</p>
           </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[booking.status]}`}>
            {booking.status}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span>{format(scheduledDate, "MMMM d, yyyy")}</span>
        </div>
         <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span>{format(scheduledDate, "h:mm a")}</span>
        </div>
        {booking.videoRoomUrl && isConfirmed && (
             <div className="flex items-center gap-2 text-indigo-600">
                <Video size={16} />
                <span>Video Session</span>
            </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
         {isConfirmed && onJoinSession && (
             <button 
                onClick={() => onJoinSession(booking.bookingId)}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
             >
                 <Video size={16} /> Join Session
             </button>
         )}
         
         {(isConfirmed || isPending) && onCancel && (
             <button 
                onClick={() => onCancel(booking.bookingId)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
             >
                 Cancel
             </button>
         )}
         
         {isCancelled && (
             <button disabled className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg text-sm cursor-not-allowed">
                 Cancelled
             </button>
         )}
         
          {isCompleted && (
             <button disabled className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg text-sm cursor-not-allowed flex items-center justify-center gap-2">
                 Completed
             </button>
         )}
      </div>
    </div>
  );
};
