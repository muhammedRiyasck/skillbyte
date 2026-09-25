import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@shared/ui/Modal";
import { toast } from "sonner";
import { getResumePaymentSecret } from "../services/BookingServices";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { MentorshipCheckoutForm } from "../components/MentorshipCheckoutForm";

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
  SlidersHorizontal,
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

  const [selectedSlot, setSelectedSlot] =
    useState<IMentorshipSlot | null>(null);

  const [resumeClientSecret, setResumeClientSecret] = useState<string | null>(
    null,
  );
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

  const lastSlotElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, hasMore],
  );

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(
        scrollLeft < scrollWidth - clientWidth - 5,
      );
    }
  };

  useEffect(() => {
    checkScroll();

    window.addEventListener("resize", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
    };
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
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getUniqueTags();
        setCategories(["All", ...tags]);
      } catch (error) {
        console.error("Failed to fetch tags", error);
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

        const filters: SlotFilters = {
          page: pageNum,
          limit: ITEMS_PER_PAGE,
        };

        if (debouncedSearch) {
          filters.search = debouncedSearch;
        }

        if (selectedTags.length > 0) {
          filters.tags = selectedTags.join(",");
        }

        if (minPrice) {
          filters.minPrice = Number(minPrice);
        }

        if (maxPrice) {
          filters.maxPrice = Number(maxPrice);
        }

        if (fromDate) {
          filters.fromDate = fromDate;
        }

        if (toDate) {
          filters.toDate = toDate;
        }

        const data = await getAvailableSlots(filters);

        if (isRefresh) {
          slotIdsRef.current.clear();

          data.forEach((s) => {
            slotIdsRef.current.add(s.slotId);
          });

          setSlots(data);
          setHasMore(data.length === ITEMS_PER_PAGE);
        } else {
          const newSlots = data.filter(
            (slot) => !slotIdsRef.current.has(slot.slotId),
          );

          newSlots.forEach((s) => {
            slotIdsRef.current.add(s.slotId);
          });

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
    [
      debouncedSearch,
      selectedTags,
      minPrice,
      maxPrice,
      fromDate,
      toDate,
    ],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      setPage(1);
    }
  };

  const handleBook = (slot: IMentorshipSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleResumePayment = async (slotId: string) => {
    const slotToResume = slots.find(
      (s) => s.slotId === slotId,
    );

    if (!slotToResume || !slotToResume.pendingBookingId) {
      return;
    }

    try {
      setIsResumingPayment(true);

      const { clientSecret } = await getResumePaymentSecret(
        slotToResume.pendingBookingId,
      );

      setResumeClientSecret(clientSecret);
    } catch (error) {
      console.error("Failed to resume payment", error);
      toast.error("Failed to resume payment");
    } finally {
      setIsResumingPayment(false);
    }
  };

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
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setMinPrice("");
    setMaxPrice("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="min-h-screen bg-white pb-10 text-gray-950 dark:bg-[#050914] dark:text-white">
      {/* =========================================================
          HEADER / SEARCH AREA
      ========================================================= */}
      <header className="lg:sticky lg:top-0 z-20 bg-white/95 dark:bg-[#050914]/95 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-5 lg:pt-6">
          {/* Top row */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-1">
                Always Learn
              </p>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-950 dark:text-white flex items-center gap-3"
              >
                <span>Mentorship Program</span>
              </motion.h1>
            </div>

            {/* Refresh */}
            <button
              onClick={() => {
                refreshSlots();
                toast.success("Mentorship slots refreshed");
              }}
              className="shrink-0 inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b1220] text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Search */}
          <div className="pb-4">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                <input
                  type="text"
                  placeholder="Search by instructor or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-[#0b1220] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:bg-[#101827]"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-all ${
                  showFilters
                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-[#0b1220] dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-[#101827]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </motion.button>
            </div>
          </div>

          {/* Advanced filters */}
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#0b1220] sm:grid-cols-2 lg:grid-cols-4">
                  {/* Min price */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500">
                      Min Price
                    </label>

                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-[#101827] dark:text-white"
                    />
                  </div>

                  {/* Max price */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500">
                      Max Price
                    </label>

                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-[#101827] dark:text-white"
                    />
                  </div>

                  {/* From date */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500">
                      From Date
                    </label>

                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-[#101827] dark:text-white"
                    />
                  </div>

                  {/* To date */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500">
                      To Date
                    </label>

                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-[#101827] dark:text-white"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tags */}
          <div className="relative -mx-1 flex items-center pb-3">
            {showLeftArrow && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md backdrop-blur-md transition-transform hover:scale-105 dark:border-gray-700 dark:bg-[#101827]/95 dark:text-gray-300"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="no-scrollbar flex w-full items-center gap-2 overflow-x-auto px-1 py-1 scroll-smooth"
            >
              {tagsLoading
                ? Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 w-20 shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
                    />
                  ))
                : categories.map((cat) => {
                    const isActive =
                      cat === "All"
                        ? selectedTags.length === 0
                        : selectedTags.includes(cat);

                    return (
                      <motion.button
                        key={cat}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleTag(cat)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
                          isActive
                            ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-800 dark:bg-[#0b1220] dark:text-gray-400 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        }`}
                      >
                        {cat === "All" ? (
                          <Filter className="h-3.5 w-3.5" />
                        ) : (
                          <Tag
                            className={`h-3.5 w-3.5 ${
                              isActive
                                ? "text-blue-100"
                                : "text-blue-500"
                            }`}
                          />
                        )}

                        {cat}
                      </motion.button>
                    );
                  })}
            </div>

            {showRightArrow && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md backdrop-blur-md transition-transform hover:scale-105 dark:border-gray-700 dark:bg-[#101827]/95 dark:text-gray-300"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Bottom border */}
          <div className="border-b border-gray-200 dark:border-gray-800" />
        </div>
      </header>

      {/* =========================================================
          PAGE CONTENT
      ========================================================= */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        {initialLoading ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>

            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Finding available slots...
            </p>
          </div>
        ) : slots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-center shadow-sm dark:border-gray-800 dark:bg-[#0b1220]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Users className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">
              No mentorship slots found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              Try changing your search or filters to find available
              mentorship sessions.
            </p>

            <button
              onClick={clearFilters}
              className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-10">
              {Object.entries(groupedSlots).map(
                ([mentorId, data], mentorIndex) => {
                  const availableSlots = data.slots.filter(
                    (slot) =>
                      slot.status === SlotStatus.AVAILABLE,
                  );

                  const jobTitle =
                    data.instructor.jobTitle
                      ?.split(" ")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1),
                      )
                      .join(" ") || "Industry Specialist";

                  return (
                    <motion.section
                      key={mentorId}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: Math.min(mentorIndex * 0.05, 0.25),
                      }}
                    >
                      {/* =================================================
                          MENTOR HEADER
                      ================================================= */}
                      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-[#0b1220] sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex min-w-0 items-center gap-4">
                          {/* Avatar */}
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-[#101827]">
                            {data.instructor.profilePicture ? (
                              <img
                                src={data.instructor.profilePicture}
                                alt={data.instructor.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-blue-50 text-xl font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                {data.instructor.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Mentor information */}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="truncate text-base font-bold text-gray-950 dark:text-white sm:text-lg">
                                {data.instructor.name}
                              </h2>

                              <svg
                                className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-label="Verified mentor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>

                              {data.instructor.averageRating !==
                                undefined && (
                                <div className="inline-flex items-center gap-1 rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 dark:border-yellow-800/40 dark:bg-yellow-500/10">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />

                                  <span className="text-[11px] font-bold text-yellow-700 dark:text-yellow-400">
                                    {data.instructor.averageRating.toFixed(
                                      1,
                                    )}
                                  </span>

                                  <span className="text-[10px] text-yellow-600/70 dark:text-yellow-500/70">
                                    (
                                    {data.instructor
                                      .totalReviews || 0}
                                    )
                                  </span>
                                </div>
                              )}
                            </div>

                            <p className="mt-0.5 truncate text-sm font-medium text-blue-600 dark:text-blue-400">
                              {jobTitle}
                            </p>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                              {availableSlots.length}{" "}
                              available{" "}
                              {availableSlots.length === 1
                                ? "slot"
                                : "slots"}
                            </p>
                          </div>
                        </div>

                        {/* Availability badge */}
                        <div className="hidden shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-[#101827] sm:block">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Sessions
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {data.slots.length} listed
                          </p>
                        </div>
                      </div>

                      {/* =================================================
                          SLOT GRID
                      ================================================= */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {data.slots.map((slot, slotIndex) => (
                          <motion.div
                            key={slot.slotId}
                            initial={{
                              opacity: 0,
                              y: 12,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            transition={{
                              duration: 0.3,
                              delay: Math.min(
                                slotIndex * 0.035,
                                0.2,
                              ),
                            }}
                            whileHover={{
                              y: -3,
                            }}
                            className="min-w-0"
                          >
                            <SlotCard
                              slot={slot}
                              onBook={handleBook}
                              onResumePayment={
                                handleResumePayment
                              }
                              variant="student"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  );
                },
              )}
            </div>

            {/* =========================================================
                INFINITE SCROLL
            ========================================================= */}
            {hasMore && !loading && (
              <div
                ref={lastSlotElementRef}
                className="h-10 w-full"
              />
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-[#0b1220]">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />

                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Loading more mentors...
                  </span>
                </div>
              </div>
            )}

            {!hasMore && slots.length > 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                  <span className="h-px w-8 bg-gray-200 dark:bg-gray-800" />
                  No more slots to load
                  <span className="h-px w-8 bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* =========================================================
          BOOKING MODAL
      ========================================================= */}
      {selectedSlot && (
        <SlotBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refreshSlots}
          onBookingInitiated={(bookingId) => {
            setSlots((prevSlots) =>
              prevSlots.map((s) => {
                if (s.slotId === selectedSlot.slotId) {
                  return {
                    ...s,
                    isPendingForUser: true,
                    pendingBookingId: bookingId,
                  };
                }

                return s;
              }),
            );
          }}
          onPendingBookingCancelled={(slotId) => {
            setSlots((prevSlots) =>
              prevSlots.map((s) => {
                if (s.slotId === slotId) {
                  return {
                    ...s,
                    isPendingForUser: false,
                    pendingBookingId: undefined,
                    status: SlotStatus.AVAILABLE,
                  };
                }

                return s;
              }),
            );
          }}
          slot={selectedSlot}
        />
      )}

      {/* =========================================================
          RESUME PAYMENT MODAL
      ========================================================= */}
      {resumeClientSecret && (
        <Modal
          isOpen={!!resumeClientSecret}
          onClose={() => setResumeClientSecret(null)}
          title="Complete Payment"
        >
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: resumeClientSecret,
            }}
          >
            <MentorshipCheckoutForm
              onSuccess={() => {
                toast.success(
                  "Payment successful! Your booking is confirmed.",
                );

                setResumeClientSecret(null);
                refreshSlots();
              }}
            />
          </Elements>
        </Modal>
      )}

      {/* =========================================================
          PAYMENT LOADING INDICATOR
      ========================================================= */}
      <AnimatePresence>
        {isResumingPayment && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-[#0b1220] px-4 py-3 text-sm font-medium text-white shadow-xl shadow-black/20"
          >
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            Loading payment details...
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          SCROLLBAR STYLE
      ========================================================= */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }

            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `,
        }}
      />
    </div>
  );
};

export default MentorshipBrowsePage;

