import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import { cn } from "@shared/utils/cn";
import ToggleSwitch from "@/shared/ui/ToggleSwitch";
import Modal from "@/shared/ui/Modal";
import { updateCourseStatus, blockCourse } from "../services/CourseStatus";

import type { Ibase } from "../types/IBase";

interface CourseCardProps {
  courses: Ibase[];
  role?: string;
  onStatusChange?: ((courseId: string, status: string) => void) | undefined;
  onBlockChange?: ((courseId: string, isBlocked?: boolean) => void) | undefined;
  page?: number;
}


const CourseCard = memo<CourseCardProps>(({
  courses,
  role = 'student',
  onStatusChange,
  onBlockChange,
  page = 1
}) => {
const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState<{ 
    isOpen: boolean; 
    courseId: string; 
    newStatus: string; 
    action: "status" | "block";
    isBlocked?: boolean; 
  }>({
    isOpen: false,
    courseId: "",
    newStatus: "list",
    action: "status"
  });

  const handleToggleChange = useCallback((course: Ibase) => {
    if (role === 'admin') {
      
       setConfirmModal({
        isOpen: true,
        courseId: course._id,
        newStatus: "", 
        action: "block",
        isBlocked: !course.isBlocked
      });
    } else {
      const newStatus = course.status === "list" ? "unlist" : "list";
      setConfirmModal({
        isOpen: true,
        courseId: course._id,
        newStatus,
        action: "status"
      });
    }
  }, [role]);

  const confirmStatusChange = useCallback(async () => {
    try {
      if (confirmModal.action === "status") {
        await updateCourseStatus(confirmModal.courseId, confirmModal.newStatus as "list" | "unlist");
        if (onStatusChange) {
          onStatusChange(confirmModal.courseId, confirmModal.newStatus);
        }
      } else if (confirmModal.action === "block") {
         await blockCourse(confirmModal.courseId, confirmModal.isBlocked!);

         // The parent component's state will be updated via onBlockChange, triggering a re-render.

         if (onBlockChange) {
            onBlockChange(confirmModal.courseId, confirmModal.isBlocked  );
         }
      }
    } catch (error) {
      console.error("Failed to update course status:", error);
    } finally {
      setConfirmModal({ isOpen: false, courseId: "", newStatus: "list", action: "status" });
    }
  }, [confirmModal, onStatusChange, onBlockChange]);

  const cancelStatusChange = useCallback(() => {
    setConfirmModal({ isOpen: false, courseId: "", newStatus: "list", action: "status" });
  }, []);

  const getStatusBadge = (status: Ibase['status']) => {
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
        "text-white z-1 absolute right-2 top-2 px-3 py-1 rounded-md text-xs font-medium",
        config.className
      )}>
        {config.label}
      </span>
    );
  };
  
  const getActionButton = (course: Ibase) => {

    if (role === 'student') {
      // Action Button for Students
      return (
        <button
          onClick={() => navigate(ROUTES.course.details.replace(':courseId', course._id), { state: { page } })}
          className={cn(
            "mt-4 w-full text-white font-medium py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 cursor-pointer",
            course.isEnrolled 
              ? "bg-green-800 hover:bg-green-900 focus:ring-green-500" 
              : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
          )}
        >
          {course.isEnrolled ? 'Continue Learning' : 'Enroll Now'}
        </button>
      );
    }else if(role === 'instructor' ){

    // Action Button for Instructors
    return (
      <button
        onClick={() => {navigate(ROUTES.instructor.uploadCourseContent, {
          state: { courseId: course._id, page }
        })}}
        className={
          "mt-4 w-full text-white font-medium py-2 rounded-lg transition-colors focus:outline-none cursor-pointer bg-indigo-500 hover:bg-indigo-600"}
      >
        Continue Upload
      </button>
    );
  }else if(role === 'admin'){
    return (
      <button
        onClick={() => navigate(ROUTES.course.details.replace(':courseId', course._id), { state: { page } })}
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
          key={course._id}
          className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 flex flex-col group hover:-translate-y-2 border border-gray-100 dark:border-gray-700 ${role === 'instructor' && course.isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="rounded-lg overflow-hidden mb-4 relative">

            {role === 'instructor' && course.isBlocked && (
              <div className="absolute top-3 z-10 left-3  flex items-center gap-1.5 bg-gradient-to-r bg-yellow-800 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
            
                <span className="font-light">! Blocked by Admin</span>
              </div>
            )}
            {role !== 'student' && course.isBlocked === false && getStatusBadge(course.status)}
            {role === 'student' && course.isEnrolled && (
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
            {role === 'instructor' && course.isBlocked === false ? (
              <ToggleSwitch
                checked={course.status === "list"}
                onChange={() => handleToggleChange(course)}
              />
            ):role==='admin'?
            <ToggleSwitch
                checked={course.isBlocked || false} // Default to false if undefined
                label="block"
                onChange={() => handleToggleChange(course)}
              />:null}
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
        title={
          confirmModal.action === 'block' 
            ? `Confirm ${confirmModal.isBlocked ? 'Block' : 'Unblock'} Course`
            : `Confirm ${confirmModal.newStatus === "list" ? "List" : "Unlist"} Course`
        }
        onConfirm={confirmStatusChange}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      >
        <p className="text-gray-700 dark:text-gray-300">
           {confirmModal.action === 'block'
            ? `Are you sure you want to ${confirmModal.isBlocked ? 'block' : 'unblock'} this course?`
            : `Are you sure you want to ${confirmModal.newStatus === "list" ? "list" : "unlist"} this course?`
          }
        </p>
      </Modal>
    </div>
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;

