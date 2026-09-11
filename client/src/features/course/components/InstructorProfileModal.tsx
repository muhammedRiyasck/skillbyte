import React, { useEffect } from "react";
import { MessageSquare, Star, X } from "lucide-react";

type InstructorProfile = {
  avatar?: string;
  name?: string;
  title?: string;
  bio?: string;
  averageRating?: number;
  totalReviews?: number;
};

type InstructorProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  instructor: InstructorProfile | null | undefined;
  defaultProfile: string;
  canMessage: boolean;
  isMessaging: boolean;
  onMessage: () => void;
};

const InstructorProfileModal: React.FC<InstructorProfileModalProps> = ({
  isOpen,
  onClose,
  instructor,
  defaultProfile,
  canMessage,
  isMessaging,
  onMessage,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const name = instructor?.name || "Instructor";
  const title = instructor?.title || "Instructor";
  const bio = instructor?.bio?.trim();
  const rating = instructor?.averageRating ?? 0;
  const reviews = instructor?.totalReviews ?? 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructor-profile-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-gray-950/55 backdrop-blur-sm dark:bg-black/70" />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-black/20 dark:border-gray-800 dark:bg-[#0b1220] dark:shadow-black/50">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-600/15 via-blue-400/5 to-transparent dark:from-blue-500/15" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close instructor profile"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 transition-colors hover:text-gray-900 dark:border-gray-800 dark:bg-[#101827]/90 dark:text-gray-400 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <img
              src={instructor?.avatar || defaultProfile}
              alt={name}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-blue-500/10"
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="instructor-profile-title"
                  className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white"
                >
                  {name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
                  Instructor
                </span>
              </div>

              <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                {title}
              </p>

              {rating > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {reviews} {reviews === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 border-t border-gray-200 pt-6 dark:border-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              About the instructor
            </p>
            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
              {bio || "No instructor bio has been added yet."}
            </p>
          </div>

          {canMessage && (
            <button
              type="button"
              onClick={onMessage}
              disabled={isMessaging}
              className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-blue-500"
            >
              <MessageSquare className="h-4 w-4" />
              {isMessaging ? "Opening conversation..." : "Message instructor"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export {InstructorProfileModal};
