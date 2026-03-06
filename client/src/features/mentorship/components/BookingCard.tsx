import type { IMentorshipBooking } from "../types/mentorshipTypes";
import { format } from "date-fns";
import { Calendar, Clock, Video, User, Timer, Wallet } from "lucide-react";
import { BookingStatus } from "@shared/enums/BookingStatus";
import { UserRole } from "@shared/enums/UserRole";

interface BookingCardProps {
  booking: IMentorshipBooking;
  onJoinSession?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  userRole: UserRole.INSTRUCTOR | UserRole.STUDENT;
}

export const BookingCard = ({
  booking,
  onJoinSession,
  onCancel,
  userRole,
}: BookingCardProps) => {
  const isConfirmed = booking.status === BookingStatus.CONFIRMED;
  const isPending = booking.status === BookingStatus.PENDING;
  const isCancelled = booking.status === BookingStatus.CANCELLED;
  const isCompleted = booking.status === BookingStatus.COMPLETED;

  const scheduledDate = new Date(booking.scheduledAt);
  const slot = typeof booking.slotId === "object" ? booking.slotId : null;

  const otherParty =
    userRole === UserRole.INSTRUCTOR
      ? typeof booking.studentId === "object"
        ? booking.studentId
        : { name: "Student", profilePicture: "" }
      : typeof booking.instructorId === "object"
        ? booking.instructorId
        : { name: "Instructor", profilePicture: "", jobTitle: "" };

  const statusColors: Record<BookingStatus, string> = {
    [BookingStatus.CONFIRMED]:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    [BookingStatus.PENDING]:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    [BookingStatus.CANCELLED]: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    [BookingStatus.COMPLETED]: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    [BookingStatus.REFUNDED]:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            {otherParty.profilePicture ? (
              <img
                src={otherParty.profilePicture}
                alt={otherParty.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={20} />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {otherParty.name}
            </h4>
            <p className="text-xs text-gray-500 capitalize">
              {userRole === UserRole.STUDENT
                ? (otherParty as { jobTitle: string }).jobTitle
                : "Student"}
            </p>
          </div>
        </div>
        <div>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[booking.status]}`}
          >
            {booking.status}
          </span>
          {booking.cancelledAt && (
            <p className="text-xs text-gray-500 mt-1">
              {" "}
              {format(booking.cancelledAt, "MMM d, yyyy")}
            </p>
          )}
          {booking.cancelledBy && (
            <p className="text-xs text-gray-500 mt-1 ">
              Cancelled by{" "}
              <span className="font-bold ">
                {booking.cancelledBy.charAt(0).toUpperCase() +
                  booking.cancelledBy.slice(1)}
              </span>
            </p>
          )}
          {booking.completedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Completed on {format(booking.completedAt, "MMM d, yyyy")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          {slot?.title || "Mentorship Session"}
        </h3>
        {slot?.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {slot.description}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Calendar size={16} className="text-indigo-500" />
            <span>{format(scheduledDate, "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock size={16} className="text-indigo-500" />
            <span>{format(scheduledDate, "h:mm a")}</span>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Timer size={16} className="text-indigo-500" />
            <span>{slot?.duration || "--"} mins</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
            <Wallet size={16} className="text-indigo-500" />
            <span>{booking.amount == 0 ? "Free" : booking.amount + ".00"}</span>
          </div>
        </div>
      </div>

      {booking.videoRoomUrl && isConfirmed && (
        <div className="mt-4 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center gap-3 text-indigo-700 dark:text-indigo-300 text-sm">
          <Video size={18} />
          <span className="font-medium">Video room is ready</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        {isConfirmed && onJoinSession && (
          <button
            onClick={() => onJoinSession(booking.bookingId)}
            className="flex-1 cursor-pointer bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <Video size={16} /> Join Session
          </button>
        )}

        {(isConfirmed || isPending) && onCancel && (
          <button
            onClick={() => onCancel(booking.bookingId)}
            className="px-4 cursor-pointer py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}

        {isCancelled && (
          <button
            disabled
            className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg text-sm cursor-not-allowed"
          >
            Cancelled
          </button>
        )}

        {isCompleted && (
          <button
            disabled
            className="w-full  py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg text-sm cursor-not-allowed flex items-center justify-center gap-2"
          >
            Completed
          </button>
        )}

        {booking.status === BookingStatus.REFUNDED && (
          <button
            disabled
            className="w-full  py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg text-sm cursor-not-allowed flex items-center justify-center gap-2"
          >
            Refunded
          </button>
        )}
      </div>
    </div>
  );
};
