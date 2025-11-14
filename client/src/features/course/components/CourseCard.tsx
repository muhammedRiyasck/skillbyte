import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@core/router/paths";
import { cn } from "@shared/utils/cn";
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

  const handleStatusChange = useCallback((courseStatus: string, courseId: string) => {
    if (onStatusChange) {
      onStatusChange(courseId, courseStatus);
      return;
    }

    switch (courseStatus) {
      case "draft":
        navigate(ROUTES.instructor.uploadCourseContent, {
          state: { courseId }
        });
        break;
      case "list":
        // Handle list action
        break;
      case "unlist":
        // Handle unlist action
        break;
      default:
        break;
    }
  }, [navigate, onStatusChange]);

  const handleEnrollment = useCallback((courseId: string) => {
    if (onEnroll) {
      onEnroll(courseId);
    } else {
      // Default enrollment logic
      console.log('Enrolling in course:', courseId);
    }
  }, [onEnroll]);

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
        onClick={() => handleEnrollment(course._id)}
        className="mt-4 w-full text-white font-medium py-2 rounded-lg transition-colors bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {/* Enroll Now */}
          View Course
        </button>
      );
    }
    
    // Action Button for Instructors
    return (
      <button
        onClick={() => handleStatusChange(course.status, course._id)}
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col group"
        >
          <div className="rounded-lg overflow-hidden mb-4 relative">
            {!isStudent && getStatusBadge(course.status)}
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <h2 className="flex justify-between text-gray-900 dark:text-white text-xl font-semibold mb-2 line-clamp-2">
            {course.title}
          </h2>

          <div className="flex items-center gap-3 mb-3 text-sm">
            <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
              PREMIUM
            </span>
            <span className="text-gray-600 dark:text-gray-300">{course.language}</span>
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
              ⭐ {course.rating} ({course.reviews} Reviews)
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-3">
            {course.subText}
          </p>

          {getActionButton(course)}
        </div>
      ))}
    </div>
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;

