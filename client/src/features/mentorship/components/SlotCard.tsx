import type { IMentorshipSlot } from "../types/mentorshipTypes";
import { format } from "date-fns";
import { Calendar, Clock, Video, Trash2, Edit, IndianRupee, Info, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { SlotStatus } from "@shared/enums/SlotStatus";

interface SlotCardProps {
    slot: IMentorshipSlot;
    onEdit?: (slot: IMentorshipSlot) => void;
    onDelete?: (slotId: string) => void;
    onBook?: (slot: IMentorshipSlot) => void;
    variant?: 'instructor' | 'student';
}

export const SlotCard = ({ slot, onEdit, onDelete, onBook, variant = 'instructor' }: SlotCardProps) => {
    const [showTags, setShowTags] = useState(false);
    const isBooked = slot.status === SlotStatus.BOOKED;

    const startTime = new Date(slot.scheduledAt);
    const endTime = new Date(startTime.getTime() + slot.duration * 60000);

    return (
        <div className={`group relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden ${isBooked
                ? 'border-gray-300 dark:border-gray-700 opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 dark:hover:border-indigo-900'
            }`}>

            {/* Decorative gradient for available slots */}
            {!isBooked && (
                <div className="absolute top-0 left-0 w-full h-1  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            {/* Main Content Area */}
            <div className="p-5 flex-1 flex flex-col">

                {/* Header Section: Title & Status */}
                <div className="flex justify-between items-start mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-lg leading-tight" title={slot.title || "Mentorship Session"}>
                            {slot.title || "Mentorship Session"}
                        </h3>

                        {/* Status Badge & Video Icon */}
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isBooked ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                                <Video size={14} className={isBooked ? 'text-gray-400' : 'text-blue-500'} />
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isBooked
                                    ? 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                    : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                }`}>
                                {slot.status}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons (Instructor Only) */}
                    {variant === 'instructor' && !isBooked && onEdit && onDelete && (
                        <div className="flex gap-1 shrink-0">
                            <button
                                onClick={() => onEdit(slot)}
                                className="p-2 cursor-pointer text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                                title="Edit Slot"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(slot.slotId)}
                                className="p-2 cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                title="Delete Slot"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Description Section */}
                <div className="mb-4">
                    <div className="flex gap-2.5 text-sm dark:text-gray-300">
                        <div className="shrink-0 pt-0.5">
                            <Info size={16} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="line-clamp-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed break-words" title={slot.description}>
                            {slot.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Tags Section */}
                <div className="mb-4 min-h-[24px]">
                    {slot.tags && slot.tags.length > 0 ? (
                        <div className="flex flex-col items-start gap-2">
                            <button
                                onClick={() => setShowTags(!showTags)}
                                className="group/tag flex items-center cursor-pointer gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                            >
                                <Tag size={14} className="group-hover/tag:text-indigo-500 transition-colors" />
                                <span>{showTags ? 'Hide Tags' : `View Tags (${slot.tags.length})`}</span>
                                {showTags ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {showTags && (
                                <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {slot.tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center px-2 py-1 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-md dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                            <Tag size={14} />
                            <span className="opacity-70">No tags</span>
                        </div>
                    )}
                </div>

                {/* Time Info Grid */}
                <div className="grid grid-cols-1 gap-2 py-3 border-t border-dashed border-gray-200 dark:border-gray-700 mt-auto">
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                            <Calendar size={16} />
                        </div>
                        <span className="font-medium truncate">{format(startTime, "EEEE, MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                            <Clock size={16} />
                        </div>
                        <span className="font-medium truncate">
                            {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                        </span>
                    </div>
                </div>

            </div>

            {/* Footer: Price & Action */}
            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                {isBooked && variant === 'student' ? <span className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-1 rounded-full">Booked</span> : <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Investment</span>
                    <div className="flex items-center gap-1 mt-0.5">
                        {slot.price > 0 ? (
                            <div className="flex items-center gap-0.5 text-gray-900 dark:text-white">
                                <IndianRupee size={16} className="text-gray-500 dark:text-gray-400" />
                                <span className="text-lg font-black">{slot.price}</span>
                            </div>
                        ) : (
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold rounded uppercase tracking-wide">
                                Free
                            </span>
                        )}
                    </div>
                </div>}

                {variant === 'student' && !isBooked && onBook && (
                    <button
                        onClick={() => onBook(slot)}
                        className="relative overflow-hidden cursor-pointer bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group/btn shrink-0"
                    >
                        <span className="relative ">Book Slot</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                    </button>
                )}
            </div>
        </div>
    );
};
