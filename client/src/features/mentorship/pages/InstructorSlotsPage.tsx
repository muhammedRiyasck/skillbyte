import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SlotList } from "../components/SlotList";
import { SlotForm } from "../components/SlotForm";
import Modal from "@shared/ui/Modal";
import type { CreateSlotRequest, IMentorshipSlot, UpdateSlotRequest } from "../types/mentorshipTypes";
import { createSlot, getInstructorSlots, updateSlot, deleteSlot } from "../services/mentorshipServices";


const InstructorSlotsPage = () => {
    const [slots, setSlots] = useState<IMentorshipSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<IMentorshipSlot | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const data = await getInstructorSlots();
            setSlots(data);
        } catch (error) {
            console.error("Failed to fetch slots", error);
            // toast.error("Failed to load slots");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const handleCreateClick = () => {
        setEditingSlot(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (slot: IMentorshipSlot) => {
        setEditingSlot(slot);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (slotId: string) => {
        if (window.confirm("Are you sure you want to delete this slot?")) {
            try {
                await deleteSlot(slotId);
                toast.success("Slot deleted");
                setSlots(prev => prev.filter(s => s.slotId !== slotId));
            } catch (error) {
                console.error("Failed to delete slot", error);
                toast.error("Failed to delete slot");
            }
        }
    };

    const handleSubmit = async (data: CreateSlotRequest) => {
        try {
            setIsSaving(true);
            if (editingSlot) {
                // Update
                const updateData: UpdateSlotRequest = {
                    ...data,
                };
                const updated = await updateSlot(editingSlot.slotId, updateData);
                setSlots(prev => prev.map(s => s.slotId === updated.slotId ? updated : s));
                toast.success("Slot updated successfully");
            } else {
                // Create
                const created = await createSlot(data);
                setSlots(prev => [...prev, created]);
                toast.success("Slot created successfully");
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(editingSlot ? "Failed to update slot" : "Failed to create slot");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen pt-14 bg-gray-50 dark:bg-gray-900">
            <div className="container  mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mentorship Slots</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage your availability and sessions.</p>
                    </div>
                    <button 
                        onClick={handleCreateClick}
                        className="flex items-center cursor-pointer gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                        <Plus size={20} />
                        Create New Slot
                    </button>
                </div>

            {loading ? (
                <div className="flex justify-center py-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <SlotList 
                    slots={slots} 
                    onEdit={handleEditClick} 
                    onDelete={handleDeleteClick} 
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSlot ? "Edit Slot" : "Create New Slot"}
                cancelLabel="Close"
                // No onConfirm, form handles it
            >
                <SlotForm 
                    {...(editingSlot ? { initialData: {
                        scheduledAt: new Date(editingSlot.scheduledAt),
                        duration: editingSlot.duration,
                        price: editingSlot.price,
                        ...(editingSlot.title ? { title: editingSlot.title } : {}),
                        ...(editingSlot.description ? { description: editingSlot.description } : {})
                    }} : {})}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                />
            </Modal>
            </div>
        </div>
    );
};

export default InstructorSlotsPage;
