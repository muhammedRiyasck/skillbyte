import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import { cn } from "@shared/utils/cn";
import ToggleSwitch from "@/shared/ui/ToggleSwitch";
import Modal from "@/shared/ui/Modal";
import { updateCourseStatus } from "../services/CourseStatus";

interface Course {
  _id: string;
  title: string;
  subText: string;
  description: string;
  rating: number;
  reviews: string;
  language: string;
  thumbnailUrl: string;
  status: 'draft' | 'list' | 'unlist';
}

interface CourseCardProps {
  courses: Course[];
  isStudent?: boolean;
  onEnroll?: (courseId: string) => void;
  onStatusChange?: (courseId: string, status: string) => void;
}


const CourseCard = memo<CourseCardProps>(({
  courses,
  isStudent = false,
  onEnroll,
  onStatusChange
}) => {
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; courseId: string; newStatus: "list" | "unlist" }>({
    isOpen: false,
    courseId: "",
    newStatus: "list"
  });



  const handleEnrollment = useCallback((courseId: string) => {
    if (onEnroll) {
      onEnroll(courseId);
    } else {
      // Default enrollment logic
      console.log('Enrolling in course:', courseId);
    }
  }, [onEnroll]);

  const handleToggleChange = useCallback((course: Course) => {
    const newStatus = course.status === "list" ? "unlist" : "list";
    setConfirmModal({
      isOpen: true,
      courseId: course._id,
      newStatus
    });
  }, []);

  const confirmStatusChange = useCallback(async () => {
    try {
      await updateCourseStatus(confirmModal.courseId, confirmModal.newStatus);
      if (onStatusChange) {
        onStatusChange(confirmModal.courseId, confirmModal.newStatus);
      }
    } catch (error) {
      console.error("Failed to update course status:", error);
    } finally {
      setConfirmModal({ isOpen: false, courseId: "", newStatus: "list" });
    }
  }, [confirmModal, onStatusChange]);

  const cancelStatusChange = useCallback(() => {
    setConfirmModal({ isOpen: false, courseId: "", newStatus: "list" });
  }, []);

  const getStatusBadge = (status: Course['status']) => {
    const statusConfig = {
      draft: { label: 'Drafted', className: 'bg-orange-400' },
      unlist: { label: 'Unlisted', className: 'bg-red-600' },
      list: { label: 'Listed', className: 'bg-green-600' }
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
        "text-white z-10 absolute right-2 top-2 px-3 py-1 rounded-md text-xs font-medium",
        config.className
      )}>
        {config.label}
      </span>
    );
  };
  
  const getActionButton = (course: Course) => {

    if (isStudent) {
      // Action Button for Students
      return (
        <button
        onClick={() => navigate(ROUTES.student.courseDetails.replace(':courseId', course._id))}
        className="mt-4 w-full text-white font-medium py-2 rounded-lg transition-colors bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          Enroll Now
          {/* View Course */}
        </button>
      );
    }

    // Action Button for Instructors
    return (
      <button
        onClick={() => {navigate(ROUTES.instructor.uploadCourseContent, {
          state: { courseId: course._id}
        })}}
        className={
          "mt-4 w-full text-white font-medium py-2 rounded-lg transition-colors focus:outline-none cursor-pointer bg-indigo-500 hover:bg-indigo-600"}
      >
        Continue Upload
      </button>
    );
  };

  // Main Render
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 my-12">
      {courses.map((course) => (
        <div
          key={course._id}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 flex flex-col group hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
        >
          <div className="rounded-lg overflow-hidden mb-4 relative">
            {!isStudent && getStatusBadge(course.status)}
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
            {!isStudent && (
              <ToggleSwitch
                checked={course.status === "list"}
                onChange={() => handleToggleChange(course)}
              />
            )}
          </h2>

          <div className="flex items-center gap-3 mb-4 text-sm flex-wrap">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              PREMIUM
            </span>
            <span className="text-gray-600 dark:text-gray-300">{course.language}</span>
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
              ⭐ {course.rating} ({course.reviews} Reviews)
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
        title={`Confirm ${confirmModal.newStatus === "list" ? "List" : "Unlist"} Course`}
        onConfirm={confirmStatusChange}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      >
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to {confirmModal.newStatus === "list" ? "list" : "unlist"} this course?
        </p>
      </Modal>
    </div>
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;

