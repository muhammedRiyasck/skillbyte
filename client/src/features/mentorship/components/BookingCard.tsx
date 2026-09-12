import type { IMentorshipBooking } from "../types/mentorshipTypes";
import { format } from "date-fns";
import {
  Calendar,
  Video,
  User,
  Star,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@shared/utils/cn";
import { BookingStatus } from "@shared/enums/BookingStatus";
import { UserRole } from "@shared/enums/UserRole";
import StarRating from "@features/review/components/StarRating";
import type { ISessionReview } from "@features/review/services/ReviewService";

interface BookingCardProps {
  booking: IMentorshipBooking;
  onJoinSession?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onReschedule?: (booking: IMentorshipBooking) => void;
  onRate?: (bookingId: string) => void;
  onResumePayment?: (bookingId: string) => void;
  userRole: UserRole.INSTRUCTOR | UserRole.STUDENT;
  existingRating?: number | ISessionReview;
}

export const BookingCard = ({
  booking,
  onJoinSession,
  onCancel,
  onReschedule,
  onRate,
  onResumePayment,
  userRole,
  existingRating,
}: BookingCardProps) => {
  const isConfirmed = booking.status === BookingStatus.CONFIRMED;
  const isPending = booking.status === BookingStatus.PENDING;
  const isCancelled = booking.status === BookingStatus.CANCELLED;
  const isCompleted = booking.status === BookingStatus.COMPLETED;
  const isRefunded = booking.status === BookingStatus.REFUNDED;

  const scheduledDate = new Date(booking.scheduledAt);
  const slot = typeof booking.slotId === "object" ? booking.slotId : null;
  const slotTitle = slot?.title || booking.slotTitle || "Mentorship Session";
  const slotDescription = slot?.description || booking.slotDescription;
  const slotDuration = slot?.duration || booking.slotDuration || 30;

  const otherParty =
    userRole === UserRole.INSTRUCTOR
      ? typeof booking.studentId === "object"
        ? booking.studentId
        : {
            name: booking.studentName || "Student",
            profilePicture: booking.studentAvatar || "",
          }
      : typeof booking.instructorId === "object"
        ? booking.instructorId
        : {
            name: booking.instructorName || "Instructor",
            profilePicture: booking.instructorAvatar || "",
            jobTitle: booking.instructorJobTitle || "",
          };

  const statusConfig = {
    [BookingStatus.CONFIRMED]: {
      label: "Confirmed",
      className:
        "bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20",
    },
    [BookingStatus.PENDING]: {
      label: "Pending Payment",
      className:
        "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
    },
    [BookingStatus.CANCELLED]: {
      label: "Cancelled",
      className:
        "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
    },
    [BookingStatus.COMPLETED]: {
      label: "Completed",
      className:
        "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
    },
    [BookingStatus.REFUNDED]: {
      label: "Refunded",
      className:
        "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20",
    },
  };

  const statusStyle = statusConfig[booking.status] || statusConfig[BookingStatus.PENDING];

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1220] shadow-sm hover:shadow-md transition-shadow duration-300 h-full p-5">
      <div>
        {/* ================= HEADER: Role/Subject & Duration ================= */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            {userRole === UserRole.STUDENT
              ? (otherParty as { jobTitle?: string }).jobTitle || "Mentorship"
              : "Mentorship Session"}
          </span>

          <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {slotDuration} mins
          </span>
        </div>

        {/* ================= TITLE + STATUS BADGE ================= */}
        <div className="flex items-start justify-between gap-3">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="min-w-0 text-lg font-bold leading-snug text-gray-900 dark:text-white line-clamp-2"
          >
            {slotTitle}
          </motion.h2>

          <span
            className={cn(
              "shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold",
              statusStyle.className
            )}
          >
            {statusStyle.label}
          </span>
        </div>

        {/* ================= DESCRIPTION ================= */}
        {slotDescription && (
          <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
            {slotDescription}
          </p>
        )}

        {/* ================= OTHER PARTY + DATE/TIME + PRICE ================= */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
              {otherParty.profilePicture ? (
                <img
                  src={otherParty.profilePicture}
                  alt={otherParty.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={16} />
              )}
            </div>

            {/* Name + Scheduled At */}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {otherParty.name}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                <Calendar size={11} className="shrink-0 text-gray-400" />
                {format(scheduledDate, "MMM d, yyyy · h:mm a")}
              </p>
            </div>
          </div>

          {/* Price */}
          {Number(booking.amount) === 0 ? (
            <span className="shrink-0 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Free
            </span>
          ) : (
            <span className="shrink-0 text-sm font-bold text-gray-900 dark:text-white">
              {booking.currency || "₹"} {booking.amount}
            </span>
          )}
        </div>

        {/* ================= VIDEO CALL STATUS BANNER ================= */}
        {booking.videoRoomUrl && isConfirmed && (
          <div className="mt-3 flex items-center justify-between gap-2 p-2.5 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Video session room is ready</span>
            </div>
            <span className="text-[11px] font-semibold flex items-center gap-0.5">
              Ready <ArrowRight size={12} />
            </span>
          </div>
        )}
      </div>

      {/* ================= FOOTER / ACTIONS ================= */}
      <div>
        {/* Divider */}
        <div className="mt-4 border-t border-gray-100 dark:border-gray-800" />

        <div className="mt-1">
          {/* Confirmed Actions */}
          {isConfirmed && (
            <div className="space-y-2 mt-4">
              {onJoinSession && (
                <button
                  onClick={() => onJoinSession(booking.bookingId)}
                  className="w-full h-10 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Video size={16} /> Join Session
                </button>
              )}

              <div className="flex gap-2 w-full">
                {userRole === UserRole.INSTRUCTOR && onReschedule && (
                  <button
                    onClick={() => onReschedule(booking)}
                    className="flex-1 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
                  >
                    Reschedule
                  </button>
                )}

                {onCancel && (
                  <button
                    onClick={() => onCancel(booking.bookingId)}
                    className="flex-1 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-colors cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Pending Actions */}
          {isPending && (
            <div className="space-y-2 mt-4">
              {booking.amount > 0 && onResumePayment && userRole === UserRole.STUDENT && (
                <button
                  onClick={() => onResumePayment(booking.bookingId)}
                  className="w-full h-10 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  Complete Payment
                </button>
              )}

              {onCancel && (
                <button
                  onClick={() => onCancel(booking.bookingId)}
                  className="w-full h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          )}

          {/* Completed Actions & Rating */}
          {isCompleted && (
            <div className="mt-4">
              {userRole === UserRole.STUDENT && (
                existingRating ? (
                  <div className="space-y-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400 text-xs font-semibold">
                        <CheckCircle2 size={13} />
                        <span>You rated this session</span>
                      </div>
                      <StarRating
                        rating={typeof existingRating === "object" ? existingRating.rating : existingRating}
                        readonly
                        size="sm"
                      />
                    </div>

                    {typeof existingRating === "object" && existingRating.comment && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                        "{existingRating.comment}"
                      </p>
                    )}

                    {typeof existingRating === "object" && existingRating.instructorReply && (
                      <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 text-xs">
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                          <MessageSquare size={11} /> Instructor Reply
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">{existingRating.instructorReply}</p>
                      </div>
                    )}
                  </div>
                ) : onRate ? (
                  <button
                    onClick={() => onRate(booking.bookingId)}
                    className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/15 transition-colors cursor-pointer"
                  >
                    <Star size={15} className="text-amber-500 fill-amber-500" />
                    Rate Session
                  </button>
                ) : null
              )}
            </div>
          )}

          {/* Cancelled / Refunded state */}
          {(isCancelled || isRefunded) && (
            <div className="mt-4">
              <button
                disabled
                className="w-full h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-sm font-semibold cursor-not-allowed"
              >
                {isRefunded ? "Session Refunded" : booking.cancelledBy ? `Cancelled by ${booking.cancelledBy}` : "Session Cancelled"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


