import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Clock,
  Users,
  Play,
  Award,
  Globe,
  BrainCircuit,
  Check,
  RefreshCw,
} from 'lucide-react';
import default_profile from '@assets/default_profile.svg';
import { UserRole } from '@shared/enums/UserRole';
import type {
  CourseDetails as CourseDetailsType,
  EnrollmentStatusResponse,
} from '../../types/CourseDetails';

interface CourseHeroProps {
  course: CourseDetailsType;
  role?: UserRole | undefined;
  isEnrolled: boolean;
  isLoading: boolean;
  enrollmentData?: EnrollmentStatusResponse | undefined;
  isClaimingCertificate: boolean;
  onRefresh: () => void;
  onOpenInstructorModal: () => void;
  onContinueLearning: () => void;
  onEnroll: () => void;
  onClaimCertificate: () => void;
  onTakeQuiz: () => void;
}

export const CourseHero: React.FC<CourseHeroProps> = ({
  course,
  role,
  isEnrolled,
  isLoading,
  enrollmentData,
  isClaimingCertificate,
  onRefresh,
  onOpenInstructorModal,
  onContinueLearning,
  onEnroll,
  onClaimCertificate,
  onTakeQuiz,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_430px]">
          {/* =====================================================
              LEFT — IMAGE BACKGROUND + COURSE INFORMATION
          ===================================================== */}
          <div className="relative min-h-[520px] overflow-hidden lg:min-h-[560px]">
            {/* COURSE HERO BACKGROUND */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Course thumbnail */}
              <img
                src={
                  course.thumbnailUrl ||
                  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop'
                }
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {/* LIGHT MODE */}
              <div className="absolute inset-0 bg-white/10 dark:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/65 to-white/5 dark:hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent dark:hidden" />

              {/* DARK MODE */}
              <div className="absolute inset-0 hidden bg-black/25 dark:block" />
              <div className="absolute inset-0 hidden bg-gradient-to-r from-[#050914]/85 via-[#050914]/45 to-transparent dark:block" />
              <div className="absolute inset-0 hidden bg-gradient-to-t from-[#050914]/65 via-transparent to-transparent dark:block" />

              {/* BLUE ATMOSPHERE */}
              <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-500/[0.07] blur-[120px] dark:bg-blue-500/[0.10]" />
              <div className="pointer-events-none absolute -bottom-40 left-[40%] h-[420px] w-[420px] rounded-full bg-blue-500/[0.04] blur-[120px] dark:bg-blue-500/[0.08]" />
            </div>

            {/* COURSE CONTENT ON TOP OF IMAGE */}
            <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-between p-7 sm:p-10 lg:min-h-[560px] lg:p-12">
              {/* TOP CONTENT */}
              <div className="max-w-4xl">
                {/* Category + Level */}
                <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  <span className="text-blue-400">{course.category}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span className="dark:text-white/60 dark:text-gray-800">
                    {course.courseLevel}
                  </span>
                </div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}
                  className="max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-gray-800 dark:text-white sm:text-5xl lg:text-6xl"
                >
                  {course.title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                  className="mt-5 max-w-2xl text-base leading-7 text-gray-800 dark:text-white/70 sm:text-lg"
                >
                  {course.subText}
                </motion.p>

                {/* Rating + Students */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.16 }}
                  className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {course.averageRating
                        ? course.averageRating.toFixed(1)
                        : '0.0'}
                    </span>
                    <span className="text-gray-800 dark:text-white/55">
                      ({course.totalReviews || 0} reviews)
                    </span>
                  </div>

                  <span className="hidden h-4 w-px bg-white/20 sm:block" />

                  <div className="flex items-center gap-2 text-gray-800 dark:text-white/60">
                    <Users className="h-4 w-4" />
                    <span>1500+ students</span>
                  </div>
                </motion.div>

                {/* Instructor */}
                <motion.button
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.24 }}
                  type="button"
                  onClick={onOpenInstructorModal}
                  className="group mt-8 flex w-fit cursor-pointer items-center gap-3 text-left"
                >
                  <img
                    src={course.instructor?.avatar || default_profile}
                    alt={course.instructor?.name || 'Instructor'}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10 transition group-hover:ring-blue-400/50"
                  />

                  <div>
                    <p className="text-sm font-semibold text-gray-800 transition-colors group-hover:text-blue-300 dark:text-white">
                      {course.instructor?.name || 'Instructor'}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-800 dark:text-white/55">
                      {course.instructor?.title || 'Instructor'}
                      <span className="mx-1.5 text-gray-800 dark:text-white/25">
                        •
                      </span>
                      <span className="text-blue-400">View profile</span>
                    </p>
                  </div>
                </motion.button>
              </div>

              {/* BOTTOM META */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-gray-800 dark:text-white/25"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Updated {new Date(course.updatedAt).toLocaleDateString()}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {course.language}
                </span>

                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      isLoading ? 'animate-spin' : ''
                    }`}
                  />
                  Refresh
                </button>
              </motion.div>
            </div>
          </div>

          {/* =====================================================
              RIGHT — ACTION CARD
          ===================================================== */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="relative z-20 bg-white dark:bg-[#0b1220]"
          >
            <div className="flex h-full flex-col border-l border-gray-200 dark:border-gray-800">
              <div className="flex h-full flex-col p-6 sm:p-7">
                {/* Access label */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                    Course access
                  </p>

                  <div className="mt-1 flex items-end justify-between gap-4">
                    <div className="text-3xl font-semibold tracking-[-0.03em] text-gray-950 dark:text-white">
                      {course.price === 0 ? (
                        <span className="text-blue-600 dark:text-blue-400">
                          Free
                        </span>
                      ) : (
                        <>₹{course.price.toLocaleString()}</>
                      )}
                    </div>

                    {course.price > 0 && (
                      <span className="pb-1 text-sm text-gray-400 line-through">
                        ₹{Math.round(course.price * 1.5)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 h-px bg-gray-200 dark:bg-gray-800" />

                {/* ENROLLMENT / CONTINUE */}
                <div>
                  {isEnrolled ||
                  role === UserRole.INSTRUCTOR ||
                  role === UserRole.ADMIN ? (
                    <div className="space-y-3">
                      {/* Enrolled status */}
                      <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3.5 dark:bg-blue-500/10">
                        <div className="flex items-center gap-2.5 text-sm font-semibold text-blue-700 dark:text-blue-300">
                          <Check className="h-4 w-4" />
                          Already enrolled
                        </div>

                        <span className="text-xs text-blue-500 dark:text-blue-400">
                          Ready to learn
                        </span>
                      </div>

                      {/* Continue */}
                      {role === UserRole.STUDENT && (
                        <button
                          onClick={onContinueLearning}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 dark:hover:bg-blue-500"
                        >
                          <Play className="h-4 w-4 fill-current" />
                          Continue learning
                        </button>
                      )}

                      {/* AI QUIZ */}
                      {role === UserRole.STUDENT &&
                        course.isQuizEnabled &&
                        (() => {
                          const progress =
                            enrollmentData?.data?.enrollment?.progress ?? 0;
                          const isUnlocked = progress >= 99;

                          if (isUnlocked) {
                            return (
                              <button
                                onClick={onTakeQuiz}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-900/60 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-500/10"
                              >
                                <BrainCircuit className="h-4 w-4" />
                                Take AI Final Quiz
                              </button>
                            );
                          }

                          return (
                            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-[#101827]">
                              <div className="flex items-center gap-2">
                                <BrainCircuit className="h-4 w-4 text-gray-400" />
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  AI Final Quiz
                                </span>
                                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                  Locked
                                </span>
                              </div>

                              <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                Reach 99% course progress to unlock. You're
                                currently at {Math.round(progress)}%.
                              </p>

                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                                <div
                                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })()}

                      {/* Certificate */}
                      {(enrollmentData?.data?.enrollment?.progress ?? 0) >=
                        100 && (
                        <button
                          onClick={onClaimCertificate}
                          disabled={isClaimingCertificate}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-900/60 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-500/10"
                        >
                          <Award className="h-4 w-4" />
                          {isClaimingCertificate
                            ? 'Preparing Certificate...'
                            : 'Get Certificate'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={onEnroll}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 dark:hover:bg-blue-500"
                    >
                      {course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
                    </button>
                  )}
                </div>

                {/* COURSE QUICK DETAILS */}
                <div className="mt-auto pt-7">
                  <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                          Duration
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {course.duration}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                          Language
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {course.language}
                        </p>
                      </div>
                    </div>

                    {/* Level / access */}
                    <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-[#101827]">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Certificate included
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Lifetime access
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CourseHero;
