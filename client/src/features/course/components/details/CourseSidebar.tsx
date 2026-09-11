import React from 'react';
import { motion } from 'framer-motion';
import { Play, FileText, Award, Users, Flag } from 'lucide-react';
import { UserRole } from '@shared/enums/UserRole';

interface CourseSidebarProps {
  totalDurationSeconds: number;
  tags?: string[] | undefined;
  role?: UserRole | undefined;
  isEnrolled: boolean;
  onOpenReportModal: () => void;
  formatDuration: (seconds: number) => string;
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  totalDurationSeconds,
  tags,
  role,
  isEnrolled,
  onOpenReportModal,
  formatDuration,
}) => {
  return (
    <aside className="lg:block">
      <div className="space-y-6 lg:sticky lg:top-6">
        {/* Includes */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-[#080e1b]"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Included
          </p>

          <h3 className="mt-2 text-lg font-semibold text-gray-950 dark:text-white">
            This course includes
          </h3>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <Play className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <span className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                {formatDuration(totalDurationSeconds)} of video content
              </span>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <span className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                Downloadable resources
              </span>
            </div>

            <div className="flex items-start gap-3">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <span className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                Certificate of completion
              </span>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <span className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                Access on mobile and desktop
              </span>
            </div>
          </div>
        </motion.div>

        {/* Topics */}
        {tags && tags.length > 0 && (
          <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Topics
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 dark:border-gray-800 dark:bg-[#0b1220] dark:text-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Report */}
        {role === UserRole.STUDENT && isEnrolled && (
          <div className="border-t border-gray-200 pt-6 dark:border-gray-800">
            <button
              type="button"
              onClick={onOpenReportModal}
              className="flex w-full cursor-pointer items-center justify-center gap-2 text-xs text-gray-400 transition-colors hover:text-red-500"
            >
              <Flag className="h-3.5 w-3.5" />
              Report this course
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default CourseSidebar;
