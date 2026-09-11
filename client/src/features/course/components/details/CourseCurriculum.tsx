import React from 'react';
import { CourseModuleAccordion } from '../CourseModuleAccordion';
import { UserRole } from '@shared/enums/UserRole';
import type { ModuleType } from '../../types/IModule';
import type { EnrollmentStatusResponse } from '../../types/CourseDetails';

interface CourseCurriculumProps {
  modules?: ModuleType[] | undefined;
  totalLessons: number;
  totalDurationSeconds: number;
  expandedModuleId: string | null;
  onToggleModule: (moduleId: string) => void;
  role?: UserRole | undefined;
  isEnrolled: boolean;
  blockedLessons: Set<string>;
  onBlockLesson: (lessonId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  enrollmentData?: EnrollmentStatusResponse | undefined;
  formatDuration: (seconds: number) => string;
}

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({
  modules,
  totalLessons,
  totalDurationSeconds,
  expandedModuleId,
  onToggleModule,
  role,
  isEnrolled,
  blockedLessons,
  onBlockLesson,
  onSelectLesson,
  enrollmentData,
  formatDuration,
}) => {
  return (
    <section className="border-b border-gray-200 py-10 dark:border-gray-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Curriculum
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-gray-950 dark:text-white sm:text-3xl">
            Course content
          </h2>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-500">
          {modules?.length || 0} modules
          <span className="mx-2 text-gray-300 dark:text-gray-700">•</span>
          {totalLessons} lessons
          <span className="mx-2 text-gray-300 dark:text-gray-700">•</span>
          {formatDuration(totalDurationSeconds)}
        </div>
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        {modules?.map((module, moduleIndex) => (
          <CourseModuleAccordion
            key={module.id}
            module={module}
            moduleIndex={moduleIndex}
            isOpen={expandedModuleId === module.id}
            onToggle={() => onToggleModule(module.id)}
            role={role}
            isEnrolled={isEnrolled}
            blockedLessons={blockedLessons}
            onBlockLesson={onBlockLesson}
            onSelectLesson={onSelectLesson}
            enrollmentData={enrollmentData}
            formatDuration={formatDuration}
          />
        ))}
      </div>
    </section>
  );
};

export default CourseCurriculum;
