import React from 'react';
import { BookOpen, Play, Clock, BrainCircuit, Award } from 'lucide-react';

interface CourseOverviewProps {
  modulesCount: number;
  totalLessons: number;
  totalDurationSeconds: number;
  isQuizEnabled?: boolean | undefined;
  formatDuration: (seconds: number) => string;
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({
  modulesCount,
  totalLessons,
  totalDurationSeconds,
  isQuizEnabled,
  formatDuration,
}) => {
  return (
    <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-[#050914]">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            Course overview
          </p>

          <span className="text-[10px] text-gray-400 dark:text-gray-600">
            At a glance
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4">
          {/* MODULES */}
          <div className="flex items-center gap-3 border-r border-gray-200 pr-5 dark:border-gray-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
            </div>

            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {modulesCount}
              </p>

              <p className="mt-0.5 text-[11px] text-gray-500">Modules</p>
            </div>
          </div>

          {/* LESSONS */}
          <div className="flex items-center gap-3 border-r border-gray-200 px-5 dark:border-gray-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Play className="h-4 w-4" />
            </div>

            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {totalLessons}
              </p>

              <p className="mt-0.5 text-[11px] text-gray-500">Lessons</p>
            </div>
          </div>

          {/* DURATION */}
          <div className="flex items-center gap-3 border-r border-gray-200 px-5 dark:border-gray-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>

            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {formatDuration(totalDurationSeconds)}
              </p>

              <p className="mt-0.5 text-[11px] text-gray-500">Total time</p>
            </div>
          </div>

          {/* CERTIFICATE */}
          <div className="flex items-center gap-3 pl-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {isQuizEnabled ? (
                <BrainCircuit className="h-4 w-4" />
              ) : (
                <Award className="h-4 w-4" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {isQuizEnabled ? 'AI Final Quiz' : 'Certificate'}
              </p>

              <p className="mt-0.5 text-[11px] text-gray-500">Included</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseOverview;
