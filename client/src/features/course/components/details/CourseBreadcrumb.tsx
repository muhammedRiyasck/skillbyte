import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, BookOpen } from 'lucide-react';
import { ROUTES } from '@/core/router/paths';

interface CourseBreadcrumbProps {
  courseTitle: string;
  onNavigateBack: () => void;
}

export const CourseBreadcrumb: React.FC<CourseBreadcrumbProps> = ({
  courseTitle,
  onNavigateBack,
}) => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);
  return (
    <div className="border-b border-gray-200/80 bg-white/90 backdrop-blur-xl dark:border-gray-800/80 dark:bg-[#050914]/90">
      <div className="mx-auto flex max-w-[1500px] items-center px-4 py-3.5 sm:px-6 lg:px-8">
        <nav className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
          <Link
            to={ROUTES.root}
            className="flex shrink-0 items-center gap-1.5 text-gray-900 dark:text-white/80 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </Link>

          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-900 dark:text-white/80" />

          <button
            type="button"
            onClick={onNavigateBack}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 text-gray-900 dark:text-white/80 transition-colors hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Courses
          </button>

          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300 dark:text-gray-700" />

          <span className="min-w-0 truncate font-medium text-gray-700 dark:text-gray-300">
            {courseTitle}
          </span>
        </nav>
      </div>
    </div>
  );
};

export default CourseBreadcrumb;
