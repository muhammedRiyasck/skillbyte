import type { IMentorshipSlot } from "../types/mentorshipTypes";
import { SlotCard } from "./SlotCard";

interface SlotListProps {
  slots: IMentorshipSlot[];
  onEdit: (slot: IMentorshipSlot) => void;
  onDelete: (slotId: string) => void;
}

export const SlotList = ({ slots, onEdit, onDelete }: SlotListProps) => {
  if (slots.length === 0) {
    return (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No slots created yet.</p>
            <p className="text-sm text-gray-400 mt-1">Create a slot to start accepting bookings.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {slots.map((slot) => (
        <SlotCard 
            key={slot.slotId} 
            slot={slot} 
            onEdit={onEdit} 
            onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
