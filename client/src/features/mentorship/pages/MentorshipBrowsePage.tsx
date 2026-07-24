import { useState, useEffect, useRef, useCallback } from "react";
import Modal from "@shared/ui/Modal";
import { toast } from "sonner";
import { getResumePaymentSecret } from "../services/BookingServices";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import  { MentorshipCheckoutForm } from "../components/MentorshipCheckoutForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
import { getAvailableSlots, getUniqueTags } from "../services/SlotServices";
import type { IMentorshipSlot, SlotFilters } from "../types/mentorshipTypes";
import { SlotCard } from "../components/SlotCard";
import { SlotBookingModal } from "../components/SlotBookingModal";
import {
  Search,
  Filter,
  Loader2,
  Users,
  RefreshCw,
  Tag,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

import { SlotStatus } from "@shared/enums/SlotStatus";

const ITEMS_PER_PAGE = 10;

const MentorshipBrowsePage = () => {
  const [slots, setSlots] = useState<IMentorshipSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<IMentorshipSlot | null>(
    null,
  );

  // Resume payment state
  const [resumeClientSecret, setResumeClientSecret] = useState<string | null>(null);
  const [isResumingPayment, setIsResumingPayment] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const [categories, setCategories] = useState<string[]>(["All"]);
  const [tagsLoading, setTagsLoading] = useState(true);

  const slotIdsRef = useRef<Set<string>>(new Set());

  // Reset ref when slots are cleared/refreshed

  const lastSlotElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Fetch unique tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getUniqueTags();
        setCategories(["All", ...tags]);
      } catch (error) {
        console.error("Failed to fetch tags", error);
        // Fallback to minimal if fails
        setCategories(["All"]);
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  const fetchSlots = useCallback(
    async (pageNum: number, isRefresh: boolean = false) => {
      try {
        setLoading(true);
        const filters: SlotFilters = { page: pageNum, limit: ITEMS_PER_PAGE };

        // Quick Search (Job Title or Instructor Name)
        if (debouncedSearch) filters.search = debouncedSearch;

        // Multiple Tags (Send as comma-separated string to ensure robust parsing on backend)
        if (selectedTags.length > 0) filters.tags = selectedTags.join(",");

        // Advanced Filters
        if (minPrice) filters.minPrice = Number(minPrice);
        if (maxPrice) filters.maxPrice = Number(maxPrice);
        if (fromDate) filters.fromDate = fromDate;
        if (toDate) filters.toDate = toDate;

        const data = await getAvailableSlots(filters);

        if (isRefresh) {
          slotIdsRef.current.clear();
          data.forEach((s) => slotIdsRef.current.add(s.slotId));
          setSlots(data);
          setHasMore(data.length === ITEMS_PER_PAGE);
        } else {
          // Deduplicate using Ref
          const newSlots = data.filter(
            (slot) => !slotIdsRef.current.has(slot.slotId),
          );

          // Update Ref
          newSlots.forEach((s) => slotIdsRef.current.add(s.slotId));

          // If we got data but it was all duplicates (or empty), stop fetching
          const ended =
            data.length < ITEMS_PER_PAGE ||
            (data.length > 0 && newSlots.length === 0);
          if (ended) {
            setHasMore(false);
          }

          setSlots((prev) => [...prev, ...newSlots]);
        }
      } catch (error) {
        console.error(error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [debouncedSearch, selectedTags, minPrice, maxPrice, fromDate, toDate],
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Unified Fetch Logic to prevent infinite loops
  const tagsString = selectedTags.join(",");
  useEffect(() => {
    const isFilterChange = page === 1;
    fetchSlots(page, isFilterChange);
  }, [
    page,
    debouncedSearch,
    tagsString,
    minPrice,
    maxPrice,
    fromDate,
    toDate,
    fetchSlots,
  ]);

  const refreshSlots = () => {
    if (page === 1) {
      fetchSlots(1, true);
    } else {
      setPage(1); // This will trigger the useEffect above
    }
  };

  const handleBook = (slot: IMentorshipSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleResumePayment = async (slotId: string) => {
    // Find the slot to get the pendingBookingId
    const slotToResume = slots.find((s) => s.slotId === slotId);
    if (!slotToResume || !slotToResume.pendingBookingId) return;

    try {
      setIsResumingPayment(true);
      const { clientSecret } = await getResumePaymentSecret(slotToResume.pendingBookingId);
      setResumeClientSecret(clientSecret);
    } catch (error) {
      console.error("Failed to resume payment", error);
      toast.error("Failed to resume payment");
    } finally {
      setIsResumingPayment(false);
    }
  };

  // Group slots by instructor
  const groupedSlots = slots.reduce(
    (acc, slot) => {
      const mentorId = slot.instructorId;
      if (!acc[mentorId]) {
        acc[mentorId] = {
          instructor: slot.instructorDetails || {
            name: "Expert Instructor",
            jobTitle: "Industry Specialist",
          },
          slots: [],
        };
      }
      acc[mentorId].slots.push(slot);
      return acc;
    },
    {} as Record<
      string,
      {
        instructor: { 
          name: string; 
          jobTitle: string; 
          profilePicture?: string;
          averageRating?: number;
          totalReviews?: number;
        };
        slots: IMentorshipSlot[];
      }
    >,
  );

  const toggleTag = (tag: string) => {
    if (tag === "All") {
      setSelectedTags([]);
      return;
    }
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-8">
      <div className="lg:sticky top-0 z-10 bg-white dark:bg-gray-900 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-800 shadow-sm px-6 py-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 lg:mb-4">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Find a Mentor
          </h1>
          <button
            onClick={() => {
              refreshSlots();
              toast.success("Mentorship slots refreshed");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        <div className="px-6 pb-2">
          <div className="flex flex-col gap-4 mb-4 mt-8 lg:mt-0">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by instructor name or job title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 cursor-pointer rounded-lg border transition-all flex items-center gap-2 ${showFilters ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white" : "bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50"}`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Tags with Horizontal Scroll & Controls */}
            <div className="relative group flex items-center">
              {/* Left Scroll Button */}
              {showLeftArrow && (
                <button
                  onClick={() => scroll("left")}
                  className="absolute opacity-0 group-hover:opacity-100 left-0 z-20 p-1.5 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:scale-110 transition-all cursor-pointer text-gray-700 dark:text-gray-300 backdrop-blur-sm"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar scroll-smooth"
              >
                {tagsLoading
                  ? // Skeleton loader for tags
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse shrink-0"
                    />
                  ))
                  : categories.map((cat) => {
                    const isActive =
                      cat === "All"
                        ? selectedTags.length === 0
                        : selectedTags.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleTag(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 ${isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                      >
                        {cat === "All" ? (
                          <Filter size={16} />
                        ) : (
                          <Tag
                            size={14}
                            className={
                              isActive ? "text-indigo-200" : "text-indigo-600"
                            }
                          />
                        )}
                        {cat}
                      </button>
                    );
                  })}
              </div>

              {/* Right Scroll Button */}
              {showRightArrow && (
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-0 z-20 p-1.5 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:scale-110 transition-all cursor-pointer text-gray-700 dark:text-gray-300 backdrop-blur-sm"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add global style for no-scrollbar to ensure it works across browsers */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `,
        }}
      />

      <div className="container mx-auto px-6 py-8">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-gray-500">Finding available slots...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No mentorship slots found matching your filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedTags([]);
                setMinPrice("");
                setMaxPrice("");
                setFromDate("");
                setToDate("");
              }}
              className="mt-4 text-indigo-600 cursor-pointer font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-12">
              {Object.entries(groupedSlots).map(([mentorId, data]) => {
                const availableSlots = data.slots.filter(
                  (slot) => slot.status === SlotStatus.AVAILABLE,
                );
                const jobTitle =
                  data.instructor.jobTitle
                    ?.split(" ")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1),
                    )
                    .join(" ") || "Industry Specialist";
                return (
                  <section
                    key={mentorId}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                  >
                    <div className="flex items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border-2 border-indigo-50 dark:border-indigo-800 overflow-hidden">
                        {data.instructor.profilePicture ? (
                          <img
                            src={data.instructor.profilePicture}
                            alt={data.instructor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold">
                            {data.instructor.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {data.instructor.name}
                          </h2>
                          <svg
                            className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {data.instructor.averageRating !== undefined && (
                            <div className="flex items-center gap-1 ml-2 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800/50">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">
                                {data.instructor.averageRating.toFixed(1)}
                              </span>
                              <span className="text-[10px] text-yellow-600/70 dark:text-yellow-500/50">
                                ({data.instructor.totalReviews || 0})
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                          {jobTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {availableSlots.length} available slots
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {data.slots.map((slot) => {
                        return (
                          <SlotCard
                            key={slot.slotId}
                            slot={slot}
                            onBook={handleBook}
                            onResumePayment={handleResumePayment}
                            variant="student"
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Sentinel for infinite scroll */}
            {hasMore && !loading && (
              <div ref={lastSlotElementRef} className="h-10 w-full" />
            )}

            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
            {!hasMore && slots.length > 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No more slots to load.
              </div>
            )}
          </>
        )}
      </div>

      {selectedSlot && (
        <SlotBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refreshSlots}
          onBookingInitiated={(bookingId) => {
            // Instantly update the UI so the button changes to "Continue Payment" without waiting for a refresh
            setSlots((prevSlots) =>
              prevSlots.map((s) => {
                if (s.slotId === selectedSlot.slotId) {
                  return { ...s, isPendingForUser: true, pendingBookingId: bookingId };
                }
                return s;
              })
            );
          }}
          onPendingBookingCancelled={(slotId) => {
            // Instantly revert the slot back to available
            setSlots((prevSlots) =>
              prevSlots.map((s) => {
                if (s.slotId === slotId) {
                  return { ...s, isPendingForUser: false, pendingBookingId: undefined, status: SlotStatus.AVAILABLE };
                }
                return s;
              })
            );
          }}
          slot={selectedSlot}
        />
      )}

      {/* Resume Payment Modal */}
      {resumeClientSecret && (
        <Modal
          isOpen={!!resumeClientSecret}
          onClose={() => setResumeClientSecret(null)}
          title="Complete Payment"
        >
          <Elements stripe={stripePromise} options={{ clientSecret: resumeClientSecret }}>
            <MentorshipCheckoutForm
              onSuccess={() => {
                toast.success("Payment successful! Your booking is confirmed.");
                setResumeClientSecret(null);
                refreshSlots();
              }}
            />
          </Elements>
        </Modal>
      )}

      {/* Loading Toast Overlay */}
      {isResumingPayment && (
        <div className="fixed bottom-4 right-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Loading payment details...
        </div>
      )}
    </div>
  );
};

export default MentorshipBrowsePage;
