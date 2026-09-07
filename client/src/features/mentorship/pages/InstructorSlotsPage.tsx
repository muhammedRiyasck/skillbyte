import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, ChevronLeft, ChevronRight, Filter, Clock } from "lucide-react";
import { toast } from "sonner";
import { SlotList } from "../components/SlotList";
import { SlotForm } from "../components/SlotForm";
import Modal from "@shared/ui/Modal";
import type {
    CreateSlotRequest,
    CreateRecurringSlotRequest,
    IMentorshipSlot,
    UpdateSlotRequest,
    InstructorSlotFilters,
} from "../types/mentorshipTypes";
import {
    createSlot,
    createRecurringSlots,
    getInstructorSlots,
    updateSlot,
    deleteSlot,
    deleteRecurringSlots,
} from "../services/SlotServices";
import { SlotStatus } from "../../../shared/enums/SlotStatus";

const InstructorSlotsPage = () => {
    const [slots, setSlots] = useState<IMentorshipSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<IMentorshipSlot | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState<IMentorshipSlot | null>(null);
    const [deleteScope, setDeleteScope] = useState<'single' | 'series'>('single');
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter & Pagination State
    const [filters, setFilters] = useState<InstructorSlotFilters>({
        page: 1,
        limit: 12,
    });
    const [hasMore, setHasMore] = useState(true);

    const fetchSlots = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getInstructorSlots(filters);
            setSlots(data);

            // Simple check for pagination end
            if (data.length < (filters.limit || 10)) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }
        } catch (error) {
            console.error("Failed to fetch slots", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchSlots();
    }, [filters, fetchSlots]);

    const handleCreateClick = () => {
        setEditingSlot(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (slot: IMentorshipSlot) => {
        setEditingSlot(slot);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (slotId: string, slot?: IMentorshipSlot) => {
        const target = slot || slots.find(s => s.slotId === slotId) || null;
        setSlotToDelete(target);
        setDeleteScope('single');
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!slotToDelete) return;
        try {
            setIsDeleting(true);
            if (deleteScope === 'series' && slotToDelete.recurrenceGroupId) {
                const result = await deleteRecurringSlots(slotToDelete.recurrenceGroupId, true);
                toast.success(`Deleted ${result.deletedCount} upcoming slots in the series`);
                setSlots(prev => prev.filter(s => {
                    if (
                        s.recurrenceGroupId === slotToDelete.recurrenceGroupId &&
                        new Date(s.scheduledAt) > new Date() &&
                        s.status === SlotStatus.AVAILABLE
                    ) {
                        return false;
                    }
                    return true;
                }));
            } else {
                await deleteSlot(slotToDelete.slotId);
                toast.success("Slot deleted");
                setSlots(prev => prev.filter(s => s.slotId !== slotToDelete.slotId));
            }
            setIsDeleteModalOpen(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Failed to delete slot", error);
            toast.error(error.response?.data?.message || "Failed to delete slot");
        } finally {
            setIsDeleting(false);
            setSlotToDelete(null);
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
                if (filters.page === 1) {
                    setSlots(prev => [created, ...prev]);
                } else {
                    fetchSlots();
                }
                toast.success("Slot created successfully");
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRecurringSubmit = async (data: CreateRecurringSlotRequest) => {
        try {
            setIsSaving(true);
            const result = await createRecurringSlots(data);
            if (result.skippedCount > 0) {
                toast.success(
                    `Created ${result.createdCount} recurring slots (${result.skippedCount} conflicting dates skipped).`
                );
            } else {
                toast.success(`Successfully created ${result.createdCount} recurring slots`);
            }
            await fetchSlots();
            setIsModalOpen(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Failed to create recurring slots", error);
            toast.error(error.response?.data?.message || "Failed to create recurring slots");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFilterChange = (status: SlotStatus | 'all') => {
        setFilters(prev => {
            const newFilters: InstructorSlotFilters = {
                ...prev,
                page: 1
            };
            if (status === 'all') {
                delete newFilters.status;
            } else {
                newFilters.status = status;
            }
            return newFilters;
        });
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Full-width Header aligned with Course Pages */}
            <div className="pt-8 sticky top-20 z-40 bg-gray-200 dark:bg-gray-700 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Clock className="w-8 h-8 text-indigo-600" />
                    Mentorship Slots
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-transparent shadow-sm rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                            value={filters.status || 'all'}
                            onChange={(e) => handleFilterChange(e.target.value as SlotStatus | 'all')}
                        >
                            <option value="all">All Status</option>
                            <option value={SlotStatus.AVAILABLE}>Available</option>
                            <option value={SlotStatus.BOOKED}>Booked</option>
                            <option value={SlotStatus.CANCELLED}>Cancelled</option>
                        </select>
                    </div>
                    <button
                        className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer"
                        title="Refresh data"
                        onClick={() => {
                            fetchSlots();
                            toast.success("Slots Refreshed");
                        }}
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center cursor-pointer gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:scale-105 font-medium shrink-0"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Create New Slot</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        {slots.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                                    <Filter className="w-8 h-8 text-gray-400" />
                                </div>
                                {(filters.page || 1) <= 1 ? <><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Slots Found</h3>
                                    <p className="text-gray-500 max-w-md">
                                        {filters.status
                                            ? `You don't have any ${filters.status} slots. Try changing the filter.`
                                            : "You haven't created any mentorship slots yet."}
                                    </p>
                                    {!filters.status && (
                                        <button
                                            onClick={handleCreateClick}
                                            className="mt-6 text-indigo-600 cursor-pointer hover:text-indigo-700 font-semibold"
                                        >
                                            Create your first slot &rarr;
                                        </button>
                                    )}</> : <p className="text-gray-500 max-w-md">Go Back To The Previous Page.<br />No More Slots To Show.</p>}
                            </div>
                        ) : (
                            <SlotList
                                slots={slots}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                            />
                        )}

                        {/* Pagination Controls */}
                        {((filters.page || 1) > 1 || hasMore) && (
                            <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                                    disabled={(filters.page || 1) <= 1 || loading}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${(filters.page || 1) <= 1
                                            ? 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                            : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm cursor-pointer'
                                        }`}
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                                    Page {filters.page || 1}
                                </span>

                                <button
                                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                                    disabled={!hasMore || loading}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${!hasMore
                                            ? 'text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                                            : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm cursor-pointer'
                                        }`}
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Create/Edit Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={editingSlot ? "Edit Slot" : "Create New Slot"}
                    cancelLabel="Close"
                >
                    <SlotForm
                        {...(editingSlot ? {
                            initialData: {
                                scheduledAt: new Date(editingSlot.scheduledAt),
                                duration: editingSlot.duration,
                                price: editingSlot.price,
                                tags: editingSlot.tags || [],
                                status: editingSlot.status,
                                ...(editingSlot.title ? { title: editingSlot.title } : {}),
                                ...(editingSlot.description ? { description: editingSlot.description } : {})
                            }
                        } : {})}
                        onSubmit={handleSubmit}
                        onSubmitRecurring={handleRecurringSubmit}
                        isLoading={isSaving}
                    />
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                    title={slotToDelete?.isRecurring ? "Delete Mentorship Slot" : "Delete Mentorship Slot"}
                    onConfirm={confirmDelete}
                    confirmLabel={isDeleting ? "Deleting..." : deleteScope === 'series' ? "Delete Series" : "Yes, Delete"}
                    cancelLabel="Cancel"
                >
                    {slotToDelete?.isRecurring && slotToDelete?.recurrenceGroupId ? (
                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                This slot is part of a recurring series. How would you like to delete it?
                            </p>
                            <div className="space-y-2">
                                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${deleteScope === 'single' ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
                                    <input
                                        type="radio"
                                        name="deleteScope"
                                        value="single"
                                        checked={deleteScope === 'single'}
                                        onChange={() => setDeleteScope('single')}
                                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Delete only this slot</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Other occurrences in this recurring series will remain intact.</p>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${deleteScope === 'series' ? 'border-red-500 bg-red-50/60 dark:bg-red-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
                                    <input
                                        type="radio"
                                        name="deleteScope"
                                        value="series"
                                        checked={deleteScope === 'series'}
                                        onChange={() => setDeleteScope('series')}
                                        className="mt-0.5 text-red-600 focus:ring-red-500"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Delete all upcoming unbooked slots in this series</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Past slots and already-booked sessions will be safely preserved.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Are you sure you want to delete this mentorship slot? This action cannot be undone and will prevent future bookings for this time.
                        </p>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default InstructorSlotsPage;
