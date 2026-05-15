import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@core/router/paths";
import { cn } from "@shared/utils/cn";
import ToggleSwitch from "@/shared/ui/ToggleSwitch";
import Modal from "@/shared/ui/Modal";
import { updateCourseStatus, blockCourse } from "../services/CourseStatus";
import { issueCertificate } from "@/features/certificate/services/CertificateService";
import type { Ibase } from "../types/IBase";
import { CourseStatus } from "@shared/enums/CourseStatus";
import { UserRole } from "@shared/enums/UserRole";

interface CourseCardProps {
  courses: Ibase[];
  role?: string;
  page?: number;
}

const CourseCard = memo<CourseCardProps>(({
  courses,
  role = 'student',
  page = 1
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [claimingCertificateId, setClaimingCertificateId] = useState<string | null>(null);
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
    action: "status"
  });


  const handleToggleChange = useCallback((course: Ibase) => {
    if (role === UserRole.ADMIN) {

      setConfirmModal({
        isOpen: true,
        id: course.id,
        newStatus: CourseStatus.DRAFT, // Dummy status for block action
        action: "block",
        isBlocked: !course.isBlocked
      });
    } else {
      const newStatus = course.status === CourseStatus.LIST ? CourseStatus.UNLIST : CourseStatus.LIST;
      setConfirmModal({
        isOpen: true,
        id: course.id,
        newStatus,
        action: "status"
      });
    }
  }, [role]);

  const confirmStatusChange = useCallback(async () => {
    try {
      if (confirmModal.action === "status") {
        await updateCourseStatus(confirmModal.id, confirmModal.newStatus);
      } else if (confirmModal.action === "block") {
        await blockCourse(confirmModal.id, confirmModal.isBlocked!);
      }

      // Invalidate queries directly after successful mutation
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
    } catch (error) {
      console.error("Failed to update course status:", error);
    } finally {
      setConfirmModal({ isOpen: false, id: "", newStatus: CourseStatus.LIST, action: "status" });
    }
  }, [confirmModal, queryClient]);

  const cancelStatusChange = useCallback(() => {
    setConfirmModal({ isOpen: false, id: "", newStatus: CourseStatus.LIST, action: "status" });
  }, []);

  const handleClaimCertificate = useCallback(async (course: Ibase) => {
    setClaimingCertificateId(course.id);
    try {
      const certificate = await issueCertificate(course.id);
      toast.success("Certificate ready");
      navigate(ROUTES.student.certificate.replace(":certificateId", certificate.certificateId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to issue certificate";
      toast.error(message);
    } finally {
      setClaimingCertificateId(null);
    }
  }, [navigate]);

  const getStatusBadge = (status: CourseStatus) => {
    const statusConfig = {
      [CourseStatus.DRAFT]: { label: 'Drafted', className: 'bg-orange-400' },
      [CourseStatus.UNLIST]: { label: 'Unlisted', className: 'bg-red-600' },
      [CourseStatus.LIST]: { label: 'Listed', className: 'bg-green-600' }
    };

    const config = statusConfig[status];
    if (!config) return null;

    if (!courses || courses.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No courses found</p>
        </div>
      );
    }

    // Status Badge
    return (
      <span className={cn(
        "text-white z-1 absolute right-2 top-2 px-3 py-1 rounded-md text-xs font-medium",
        config.className
      )}>
        {config.label}
      </span>
    );
  };

  const getActionButton = (course: Ibase) => {
    if (role === UserRole.STUDENT) {
      // Action Button for Students
      const buttonText = !course.isEnrolled 
        ? 'Enroll Now' 
        : (course.progress === 0 ? 'Start Learning' : 'Continue Learning');

      return (
        <>
          {course.isEnrolled && course.progress !== undefined && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                <span>Progress</span>
                <span>{Math.min(100, Math.round(course.progress))}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, course.progress)}%` }} 
                />
              </div>
            </div>
          )}
          {course.isEnrolled && (course.progress ?? 0) >= 100 && (
            <button
              onClick={() => handleClaimCertificate(course)}
              disabled={claimingCertificateId === course.id}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-indigo-600 text-indigo-700 dark:text-indigo-300 dark:border-indigo-400 font-semibold py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-pointer disabled:opacity-60"
            >
              <Award className="w-4 h-4" />
              {claimingCertificateId === course.id ? "Preparing..." : "Get Certificate"}
            </button>
          )}
           <button
            onClick={() => navigate(ROUTES.course.details.replace(':id', course.id), { state: { page } })}
            className={cn(
              "mt-4 w-full text-white font-medium py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 cursor-pointer",
              course.isEnrolled
                ? "bg-green-800 hover:bg-green-900 focus:ring-green-500"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            )}
          >
            {buttonText}
          </button>
        </>
      );
    } else if (role === UserRole.INSTRUCTOR) {

      // Action Button for Instructors
      return (
        <div className="flex gap-2 w-full mt-4">
          <button
            onClick={() => {
              navigate(ROUTES.instructor.uploadCourseContent, {
                state: { id: course.id, page }
              })
            }}
            className="flex-1 text-white font-medium py-2 rounded-lg transition-colors focus:outline-none cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-sm"
          >
            Content
          </button>
          <button
            onClick={() => navigate(ROUTES.instructor.quiz.config.replace(':courseId', course.id))}
            className="flex-1 text-indigo-600 border border-indigo-600 hover:bg-indigo-50 font-medium py-2 rounded-lg transition-colors focus:outline-none cursor-pointer text-sm"
          >
            Quiz Settings
          </button>
        </div>
      );
    } else if (role === UserRole.ADMIN) {
      return (
        <button
          onClick={() => navigate(ROUTES.course.details.replace(':id', course.id), { state: { page } })}
          className={
            "mt-4 w-full text-white font-medium py-2 rounded-lg transition-colors focus:outline-none cursor-pointer bg-orange-500 hover:bg-orange-600"}
        >
          Manage Course
        </button>
      );
    }

    return null;
  }

  // Main Render
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 my-12">
      {courses.map((course) => (
        <div
          key={course.id}
          className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 flex flex-col group hover:-translate-y-2 border border-gray-100 dark:border-gray-700 ${role === 'instructor' && course.isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="rounded-lg overflow-hidden mb-4 relative">

            {role === UserRole.INSTRUCTOR && course.isBlocked && (
              <div className="absolute top-3 z-10 left-3  flex items-center gap-1.5 bg-gradient-to-r bg-yellow-800 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">

                <span className="font-light">! Blocked by Admin</span>
              </div>
            )}
            {role !== UserRole.STUDENT && course.isBlocked === false && getStatusBadge(course.status)}
            {role === UserRole.STUDENT && course.isEnrolled && (
              <div className="absolute top-3 left-3  flex items-center gap-1.5 bg-gradient-to-r bg-green-800 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">

                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-light">Enrolled</span>
              </div>
            )}
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <h2 className="flex justify-between text-gray-900 dark:text-white text-xl font-bold mb-3 line-clamp-2 leading-tight">
            {course.title}
            {role === UserRole.INSTRUCTOR && course.isBlocked === false ? (
              <ToggleSwitch
                checked={course.status === CourseStatus.LIST}
                onChange={() => handleToggleChange(course)}
              />
            ) : role === UserRole.ADMIN ?
              <ToggleSwitch
                checked={course.isBlocked || false} // Default to false if undefined
                label="block"
                onChange={() => handleToggleChange(course)}
              /> : null}
          </h2>

          <div className="flex items-center justify-between gap-3 mb-4 text-sm flex-wrap">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800/50">
              ⭐ <span className="font-bold text-yellow-700 dark:text-yellow-500">{(course.averageRating ?? 0).toFixed(1)}</span> 
              <span className="text-xs text-yellow-600/70 dark:text-yellow-500/50">({course.totalReviews ?? 0} Reviews)</span>
            </span>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-sm font-bold px-3 py-1 rounded-full shadow-sm">
              ₹ {course.price}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-3 leading-relaxed mb-4">
            {course.subText}
          </p>

          {getActionButton(course)}
        </div>
      ))}

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={cancelStatusChange}
        title={
          confirmModal.action === 'block'
            ? `Confirm ${confirmModal.isBlocked ? 'Block' : 'Unblock'} Course`
            : `Confirm ${confirmModal.newStatus === CourseStatus.LIST ? "List" : "Unlist"} Course`
        }
        onConfirm={confirmStatusChange}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      >
        <p className="text-gray-700 dark:text-gray-300">
          {confirmModal.action === 'block'
            ? `Are you sure you want to ${confirmModal.isBlocked ? 'block' : 'unblock'} this course?`
            : `Are you sure you want to ${confirmModal.newStatus === CourseStatus.LIST ? "list" : "unlist"} this course?`
          }
        </p>
      </Modal>
    </div>
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;

