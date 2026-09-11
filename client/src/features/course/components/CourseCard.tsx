import { memo, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@core/router/paths";
import { cn } from "@shared/utils/cn";
import ToggleSwitch from "@/shared/ui/ToggleSwitch";
import Modal from "@/shared/ui/Modal";
import {
  updateCourseStatus,
  blockCourse,
} from "../services/CourseStatus";
import { issueCertificate } from "@/features/certificate/services/CertificateService";
import type { Ibase } from "../types/IBase";
import { CourseStatus } from "@shared/enums/CourseStatus";
import { UserRole } from "@shared/enums/UserRole";

interface CourseCardProps {
  courses: Ibase[];
  role?: string;
  page?: number;
}

const CourseCard = memo<CourseCardProps>(
  ({ courses, role = "student", page = 1 }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [claimingCertificateId, setClaimingCertificateId] =
      useState<string | null>(null);

    const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      id: string;
      newStatus: CourseStatus;
      action: "status" | "block";
      isBlocked?: boolean;
    }>({
      isOpen: false,
      id: "",
      newStatus: CourseStatus.LIST,
      action: "status",
    });

    useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, [page]);

    const handleToggleChange = useCallback(
      (course: Ibase) => {
        if (role === UserRole.ADMIN) {
          setConfirmModal({
            isOpen: true,
            id: course.id,
            newStatus: CourseStatus.DRAFT,
            action: "block",
            isBlocked: !course.isBlocked,
          });
        } else {
          const newStatus =
            course.status === CourseStatus.LIST
              ? CourseStatus.UNLIST
              : CourseStatus.LIST;

          setConfirmModal({
            isOpen: true,
            id: course.id,
            newStatus,
            action: "status",
          });
        }
      },
      [role]
    );

    const confirmStatusChange = useCallback(async () => {
      try {
        if (confirmModal.action === "status") {
          await updateCourseStatus(
            confirmModal.id,
            confirmModal.newStatus
          );
        } else if (confirmModal.action === "block") {
          await blockCourse(
            confirmModal.id,
            confirmModal.isBlocked!
          );
        }

        await queryClient.invalidateQueries({
          queryKey: ["courses"],
        });
      } catch (error) {
        console.error(
          "Failed to update course status:",
          error
        );
      } finally {
        setConfirmModal({
          isOpen: false,
          id: "",
          newStatus: CourseStatus.LIST,
          action: "status",
        });
      }
    }, [confirmModal, queryClient]);

    const cancelStatusChange = useCallback(() => {
      setConfirmModal({
        isOpen: false,
        id: "",
        newStatus: CourseStatus.LIST,
        action: "status",
      });
    }, []);

    const handleClaimCertificate = useCallback(
      async (course: Ibase) => {
        setClaimingCertificateId(course.id);

        try {
          const certificate = await issueCertificate(course.id);

          toast.success("Certificate ready");

          navigate(
            ROUTES.student.certificate.replace(
              ":certificateId",
              certificate.certificateId
            )
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to issue certificate";

          toast.error(message);
        } finally {
          setClaimingCertificateId(null);
        }
      },
      [navigate]
    );

    const getStatusBadge = (status: CourseStatus) => {
      const statusConfig = {
        [CourseStatus.DRAFT]: {
          label: "Drafted",
          className:
            "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
        },

        [CourseStatus.UNLIST]: {
          label: "Unlisted",
          className:
            "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20",
        },

        [CourseStatus.LIST]: {
          label: "Listed",
          className:
            "bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20",
        },
      };

      const config = statusConfig[status];

      if (!config) return null;

      return (
        <span
          className={cn(
            "absolute right-3 top-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold",
            config.className
          )}
        >
          {config.label}
        </span>
      );
    };

    const getActionButton = (course: Ibase) => {
      if (role === UserRole.STUDENT) {
        const buttonText = !course.isEnrolled
          ? "Enroll Now"
          : course.progress === 0
            ? "Start Learning"
            : "Continue Learning";

        return (
          <>
            {/* Progress */}
            {course.isEnrolled &&
              course.progress !== undefined && (
                <div className="mt-4 space-y-1.5">
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:1}} className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span>Progress</span>

                    <span>
                      {Math.min(
                        100,
                        Math.round(course.progress)
                      )}
                      %
                    </span>
                  </motion.div >

                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          course.progress
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

            {/* Certificate */}
            {course.isEnrolled &&
              (course.progress ?? 0) >= 100 && (
                <button
                  onClick={() =>
                    handleClaimCertificate(course)
                  }
                  disabled={
                    claimingCertificateId === course.id
                  }
                  className="
                    mt-4
                    w-full
                    h-10
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-blue-200
                    dark:border-blue-500/30
                    bg-blue-50
                    dark:bg-blue-500/10
                    text-blue-700
                    dark:text-blue-300
                    text-sm
                    font-semibold
                    hover:bg-blue-100
                    dark:hover:bg-blue-500/15
                    transition-colors
                    cursor-pointer
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  <Award className="w-4 h-4" />

                  {claimingCertificateId === course.id
                    ? "Preparing..."
                    : "Get Certificate"}
                </button>
              )}

            {/* Main action */}
            <button
              onClick={() =>
                navigate(
                  ROUTES.course.details.replace(
                    ":id",
                    course.id
                  ),
                  { state: { page } }
                )
              }
              className={cn(
                `
                  mt-4
                  w-full
                  h-10
                  rounded-xl
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  focus:outline-none
                  focus:ring-4
                  cursor-pointer
                `,
                course.isEnrolled
                  ? `
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      focus:ring-blue-500/20
                    `
                  : `
                      bg-gray-900
                      hover:bg-gray-800
                      dark:bg-white
                      dark:hover:bg-gray-100
                      dark:text-gray-900
                      text-white
                      focus:ring-gray-500/20
                    `
              )}
            >
              {buttonText}
            </button>
          </>
        );
      }

      if (role === UserRole.INSTRUCTOR) {
        return (
          <div className="flex gap-2 w-full mt-4">
            <button
              onClick={() => {
                navigate(
                  ROUTES.instructor.uploadCourseContent,
                  {
                    state: {
                      id: course.id,
                      page,
                    },
                  }
                );
              }}
              className="
                flex-1
                h-10
                rounded-xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-sm
                font-semibold
                transition-colors
                focus:outline-none
                cursor-pointer
              "
            >
              Content
            </button>

            <button
              onClick={() =>
                navigate(
                  ROUTES.instructor.quiz.config.replace(
                    ":courseId",
                    course.id
                  )
                )
              }
              className="
                flex-1
                h-10
                rounded-xl
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-[#0b1220]
                text-gray-700
                dark:text-gray-200
                text-sm
                font-semibold
                hover:bg-gray-50
                dark:hover:bg-gray-800
                transition-colors
                focus:outline-none
                cursor-pointer
              "
            >
              Quiz Settings
            </button>
          </div>
        );
      }

      if (role === UserRole.ADMIN) {
        return (
          <button
            onClick={() =>
              navigate(
                ROUTES.course.details.replace(
                  ":id",
                  course.id
                ),
                { state: { page } }
              )
            }
            className="
              mt-4
              w-full
              h-10
              rounded-xl
              bg-gray-900
              hover:bg-gray-800
              dark:bg-white
              dark:hover:bg-gray-100
              dark:text-gray-900
              text-white
              text-sm
              font-semibold
              transition-colors
              focus:outline-none
              cursor-pointer
            "
          >
            Manage Course
          </button>
        );
      }

      return null;
    };

    if (!courses || courses.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No courses found
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: index * 0.10,
            }}
            whileHover={{
              y: -4,
            }}
            className={cn(
              `
                group
                flex
                flex-col
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                dark:border-gray-800
                bg-white
                dark:bg-[#0b1220]
                shadow-sm
                hover:shadow-md
                transition-shadow
                duration-300
              `,
              role === "instructor" &&
                course.isBlocked &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {/* ========================= */}
            {/* THUMBNAIL */}
            {/* ========================= */}
            <div className="relative overflow-hidden">
              {/* Blocked badge */}
              {role === UserRole.INSTRUCTOR &&
                course.isBlocked && (
                  <div
                    className="
                      absolute
                      top-3
                      left-3
                      z-10
                      inline-flex
                      items-center
                      rounded-full
                      border
                      border-white/10
                      bg-black/65
                      backdrop-blur-sm
                      px-2.5
                      py-1
                      text-[11px]
                      font-medium
                      text-white
                    "
                  >
                    Blocked by Admin
                  </div>
                )}

              {/* Enrolled badge */}
              {role === UserRole.STUDENT &&
                course.isEnrolled && (
                  <div
                    className="
                      absolute
                      top-3
                      left-3
                      z-10
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-green-500/90
                      px-2.5
                      py-1
                      text-[11px]
                      font-semibold
                      text-white
                      backdrop-blur-sm
                    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 13 4 4L19 7"
                      />
                    </svg>

                    <span>Enrolled</span>
                  </div>
                )}

              {/* Instructor / Admin status */}
              {role !== UserRole.STUDENT &&
                course.isBlocked === false &&
                getStatusBadge(course.status)}

              <img
                src={course.thumbnailUrl}
                alt={course.title}
                loading="lazy"
                className="
                  w-full
                  h-[220px]
                  sm:h-[230px]
                  object-cover
                  transition-transform
                  duration-300
                  group-hover:scale-[1.02]
                "
              />

              {/* Subtle image overlay */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-black/5
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-300
                "
              />
            </div>

            {/* ========================= */}
            {/* CONTENT */}
            {/* ========================= */}
            <div className="flex flex-col flex-1 px-5 pt-4 pb-5">

              {/* Course level + duration */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span
                  className="
                    min-w-0
                    truncate
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-blue-600
                    dark:text-blue-400
                  "
                >
                  {course.courseLevel}
                </span>

                <span
                  className="
                    shrink-0
                    text-xs
                    text-gray-500
                    dark:text-gray-400
                    whitespace-nowrap
                  "
                >
                  {course.duration}
                </span>
              </div>

              {/* Title + Toggle */}
              <div className="flex items-start justify-between gap-3">
                <motion.h2
                initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }} 
                  className="
                    min-w-0
                    text-lg
                    font-bold
                    leading-snug
                    text-gray-900
                    dark:text-white
                    line-clamp-2
                  "
                >
                  {course.title}
                </motion.h2>

                {role === UserRole.INSTRUCTOR &&
                course.isBlocked === false ? (
                  <div className="shrink-0">
                    <ToggleSwitch
                      checked={
                        course.status === CourseStatus.LIST
                      }
                      onChange={() =>
                        handleToggleChange(course)
                      }
                    />
                  </div>
                ) : role === UserRole.ADMIN ? (
                  <div className="shrink-0">
                    <ToggleSwitch
                      checked={course.isBlocked || false}
                      label="block"
                      onChange={() =>
                        handleToggleChange(course)
                      }
                    />
                  </div>
                ) : null}
              </div>

              {/* Description */}
              <p
                className="
                  mt-3
                  text-sm
                  leading-relaxed
                  text-gray-500
                  dark:text-gray-400
                  line-clamp-2
                "
              >
                {course.subText}
              </p>

              {/* Rating + Price */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    min-w-0
                    text-xs
                    text-gray-500
                    dark:text-gray-400
                  "
                >
                  <span className="text-amber-500 text-sm">
                    ★
                  </span>

                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {(course.averageRating ?? 0).toFixed(1)}
                  </span>

                  <span className="truncate">
                    · {course.totalReviews ?? 0} reviews
                  </span>
                </div>

                {Number(course.price) === 0 ? (
                  <span
                    className="
                      shrink-0
                      text-sm
                      font-bold
                      text-emerald-600
                      dark:text-emerald-400
                    "
                  >
                    Free
                  </span>
                ) : (
                  <span
                    className="
                      shrink-0
                      text-sm
                      font-bold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    ₹ {course.price}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="mt-4 border-t border-gray-100 dark:border-gray-800" />

              {/* Actions */}
              <div className="mt-1">
                {getActionButton(course)}
              </div>
            </div>
          </motion.div>
        ))}

        {/* ========================= */}
        {/* CONFIRMATION MODAL */}
        {/* ========================= */}
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={cancelStatusChange}
          title={
            confirmModal.action === "block"
              ? `Confirm ${
                  confirmModal.isBlocked
                    ? "Block"
                    : "Unblock"
                } Course`
              : `Confirm ${
                  confirmModal.newStatus === CourseStatus.LIST
                    ? "List"
                    : "Unlist"
                } Course`
          }
          onConfirm={confirmStatusChange}
          confirmLabel="Confirm"
          cancelLabel="Cancel"
        >
          <p className="text-gray-700 dark:text-gray-300">
            {confirmModal.action === "block"
              ? `Are you sure you want to ${
                  confirmModal.isBlocked
                    ? "block"
                    : "unblock"
                } this course?`
              : `Are you sure you want to ${
                  confirmModal.newStatus === CourseStatus.LIST
                    ? "list"
                    : "unlist"
                } this course?`}
          </p>
        </Modal>
      </div>
    );
  }
);

CourseCard.displayName = "CourseCard";

export default CourseCard;