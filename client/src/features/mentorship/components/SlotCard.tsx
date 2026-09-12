import type { IMentorshipSlot } from "../types/mentorshipTypes";
import {AnimatePresence, motion} from 'framer-motion';
import { format } from "date-fns";
import { Calendar, Clock, Video, Trash2, Edit, IndianRupee, Info, Tag, ChevronDown, Repeat } from "lucide-react";
import { useEffect, useState } from "react";
import { SlotStatus } from "@shared/enums/SlotStatus";

interface SlotCardProps {
    slot: IMentorshipSlot;
    onEdit?: (slot: IMentorshipSlot) => void;
    onDelete?: (slotId: string, slot?: IMentorshipSlot) => void;
    onBook?: (slot: IMentorshipSlot) => void;
    onResumePayment?: (slotId: string) => void;
    variant?: 'instructor' | 'student';
}

export const SlotCard = ({ slot, onEdit, onDelete, onBook, onResumePayment, variant = 'instructor' }: SlotCardProps) => {
    const [showTags, setShowTags] = useState(false);
    
    // Treat as unavailable if booked, UNLESS it's pending for this specific user
    const isBooked = slot.status === SlotStatus.BOOKED;
    const isPendingForUser = !!slot.isPendingForUser;
    
    const startTime = new Date(slot.scheduledAt);
    const endTime = new Date(startTime.getTime() + slot.duration * 60000);
    const isExpired = new Date() > startTime;
    const isUnavailable = (isBooked && !isPendingForUser) || isExpired;

    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:'smooth'
        })
    }, []);

    return (
         <motion.div
        layout
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{
            opacity: isUnavailable ? 0.7 : 1,
            y: 0,
            scale: 1,
        }}
        transition={{
            duration: 0.3,
            ease: "easeOut",
        }}
        whileHover={
              {...(!isUnavailable && {
        whileHover: { scale: 1.08 },
    })}
        }
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-colors duration-300 dark:bg-[#0b1220] ${
            isUnavailable
                ? "cursor-not-allowed border-gray-300 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
                : "border-gray-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 dark:border-gray-800 dark:hover:border-blue-500/40"
        }`}
    >
        {/* Top accent line */}
        {!isUnavailable && (
            <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute left-0 right-0 top-0 h-1 origin-left bg-blue-500"
            />
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col p-5">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <motion.h3
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                        className="truncate text-lg font-bold leading-tight text-gray-950 dark:text-white"
                        title={slot.title || "Mentorship Session"}
                    >
                        {slot.title || "Mentorship Session"}
                    </motion.h3>

                    {/* Status */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <motion.div
    {...(!isUnavailable && {
        whileHover: { scale: 1.08 },
    })}
    className={`flex h-6 w-6 items-center justify-center rounded-full ${
        isUnavailable
            ? "bg-gray-100 dark:bg-gray-800"
            : "bg-blue-50 dark:bg-blue-500/10"
    }`}
>
    <Video
        size={14}
        className={
            isUnavailable
                ? "text-gray-400"
                : "text-blue-500"
        }
    />
</motion.div>

                        <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isUnavailable
                                    ? "border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    : isPendingForUser
                                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400"
                                      : "border-green-200 bg-green-50 text-green-700 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-400"
                            }`}
                        >
                            {isExpired
                                ? "EXPIRED"
                                : isPendingForUser
                                  ? "PENDING"
                                  : slot.status}
                        </span>

                        {slot.isRecurring && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-800/50 dark:bg-blue-500/10 dark:text-blue-300"
                                title={`Recurring slot (${slot.recurrenceRule?.frequency || "series"})`}
                            >
                                <Repeat size={10} />
                                Recurring
                            </motion.span>
                        )}
                    </div>
                </div>

                {/* Instructor actions */}
                {variant === "instructor" && onEdit && onDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex shrink-0 gap-1"
                    >
                        {!isBooked && !isExpired && (
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => onEdit(slot)}
                                className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                title="Edit Slot"
                            >
                                <Edit size={16} />
                            </motion.button>
                        )}

                        {!isBooked && (
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => onDelete(slot.slotId, slot)}
                                className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                title="Delete Slot"
                            >
                                <Trash2 size={16} />
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Description */}
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.25 }}
                className="mb-4"
            >
                <div className="flex gap-2.5 text-sm">
                    <div className="shrink-0 pt-0.5">
                        <Info
                            size={16}
                            className="text-gray-400 dark:text-gray-500"
                        />
                    </div>

                    <p
                        className="line-clamp-2 break-words text-sm leading-relaxed text-gray-600 dark:text-gray-400"
                        title={slot.description}
                    >
                        {slot.description || "No description provided."}
                    </p>
                </div>
            </motion.div>

            {/* Tags */}
            <div className="mb-4 min-h-[24px]">
                {slot.tags && slot.tags.length > 0 ? (
                    <div className="flex flex-col items-start gap-2">
                        <motion.button
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowTags(!showTags)}
                            className="group/tag flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                            <Tag
                                size={14}
                                className="transition-colors group-hover/tag:text-blue-500"
                            />

                            <span>
                                {showTags
                                    ? "Hide Tags"
                                    : `View Tags (${slot.tags.length})`}
                            </span>

                            <motion.span
                                animate={{
                                    rotate: showTags ? 180 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={14} />
                            </motion.span>
                        </motion.button>

                        <AnimatePresence initial={false}>
                            {showTags && (
                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        height: 0,
                                        y: -5,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        height: "auto",
                                        y: 0,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        height: 0,
                                        y: -5,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                        ease: "easeOut",
                                    }}
                                    className="flex flex-wrap gap-2 overflow-hidden pt-1"
                                >
                                    {slot.tags.map((tag, index) => (
                                        <motion.span
                                            key={index}
                                            initial={{
                                                opacity: 0,
                                                scale: 0.9,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                            }}
                                            transition={{
                                                delay: index * 0.03,
                                            }}
                                            className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 dark:border-blue-800/50 dark:bg-blue-500/10 dark:text-blue-300"
                                        >
                                            {tag}
                                        </motion.span>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs italic text-gray-400">
                        <Tag size={14} />
                        <span className="opacity-70">No tags</span>
                    </div>
                )}
            </div>

            {/* Date / Time */}
            <div className="mt-auto grid grid-cols-1 gap-2 border-t border-dashed border-gray-200 py-3 dark:border-gray-800">
                <motion.div
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-[#101827]">
                        <Calendar size={16} />
                    </div>

                    <span className="truncate font-medium">
                        {format(startTime, "EEEE, MMM d, yyyy")}
                    </span>
                </motion.div>

                <motion.div
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300"
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-[#101827]">
                        <Clock size={16} />
                    </div>

                    <span className="truncate font-medium">
                        {format(startTime, "h:mm a")} -{" "}
                        {format(endTime, "h:mm a")}
                    </span>
                </motion.div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-[#101827]/60">
            {/* Price */}
            {isUnavailable && variant === "student" ? (
                <span className="rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {isExpired ? "Expired" : "Booked"}
                </span>
            ) : (
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Investment
                    </span>

                    <div className="mt-0.5 flex items-center gap-1">
                        {slot.price > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-0.5 text-gray-950 dark:text-white"
                            >
                                <IndianRupee
                                    size={16}
                                    className="text-gray-500 dark:text-gray-400"
                                />

                                <span className="text-lg font-black">
                                    {slot.price}
                                </span>
                            </motion.div>
                        ) : (
                            <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold uppercase tracking-wide text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Free
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Student Actions */}
            {variant === "student" && !isUnavailable && (
                <>
                    {isPendingForUser && onResumePayment ? (
                        <motion.button
                            whileHover={{
                                y: -2,
                                scale: 1.01,
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() =>
                                onResumePayment(slot.slotId!)
                            }
                            className="cursor-pointer rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-600"
                        >
                            Continue Payment
                        </motion.button>
                    ) : onBook ? (
                        <motion.button
                            whileHover={{
                                y: -2,
                                scale: 1.01,
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onBook(slot)}
                            className="group/btn relative shrink-0 cursor-pointer overflow-hidden rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700"
                        >
                            <span className="relative z-10">
                                Book Slot
                            </span>

                            {/* Shimmer */}
                            <motion.div
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{
                                    duration: 0.7,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            />
                        </motion.button>
                    ) : null}
                </>
            )}
        </div>
    </motion.div>
    );
};
