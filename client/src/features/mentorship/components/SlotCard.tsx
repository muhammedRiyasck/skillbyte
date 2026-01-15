import type { IMentorshipSlot } from "../types/mentorshipTypes";
import { format } from "date-fns";
import { Calendar, Clock, Video,Trash2, Edit, IndianRupee } from "lucide-react";

interface SlotCardProps {
  slot: IMentorshipSlot;
  onEdit: (slot: IMentorshipSlot) => void;
  onDelete: (slotId: string) => void;
}

export const SlotCard = ({ slot, onEdit, onDelete }: SlotCardProps) => {
  const isBooked = slot.status === 'booked';
  

  const startTime = new Date(slot.scheduledAt);
  const endTime = new Date(startTime.getTime() + slot.duration * 60000);
  const duration = slot.duration;

  return (
    <div className={`p-4 rounded-xl border transition-all ${isBooked ? 'bg-gray-50 border-gray-200 opacity-80' : 'bg-white border-gray-200 shadow-sm hover:shadow-md dark:bg-gray-800 dark:border-gray-700'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {slot.title || "Mentorship Session"}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">       
            <Video className="text-blue-500" size={18} />
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${isBooked ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {slot.status}
            </span>
          </div>
        </div>
        
        {!isBooked && (
            <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(slot)}
                  className="p-1.5 cursor-pointer text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  title="Edit Slot"
                >
                    <Edit size={20} />
                </button>
                <button 
                  onClick={() => onDelete(slot.slotId)}
                  className="p-1.5 cursor-pointer text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete Slot"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <span>{format(startTime, "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")} ({duration} min)</span>
        </div>
        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <IndianRupee size={16} className="text-gray-400" />
          <span>{slot.price > 0 ? `${slot.currency} ${slot.price}` : 'Free'}</span>
        </div>
      </div>
    </div>
  );
};
