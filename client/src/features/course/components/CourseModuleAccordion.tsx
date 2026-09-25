import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { UserRole } from '@shared/enums/UserRole';
import { ContentType } from '@shared/enums/ContentType';
import ToggleSwitch from '@/shared/components/ToggleSwitch';
import type { ModuleType } from '../types/IModule';
import type { EnrollmentStatusResponse } from '../types/CourseDetails';

interface CourseModuleAccordionProps {
  module: ModuleType;
  moduleIndex: number;
  isOpen: boolean;
  onToggle: () => void;
  role?: UserRole | undefined;
  isEnrolled: boolean;
  blockedLessons: Set<string>;
  onBlockLesson: (lessonId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  enrollmentData?: EnrollmentStatusResponse | undefined;
  formatDuration: (seconds: number) => string;
}

export const CourseModuleAccordion: React.FC<CourseModuleAccordionProps> = ({
  module,
  moduleIndex,
  isOpen,
  onToggle,
  role,
  isEnrolled,
  blockedLessons,
  onBlockLesson,
  onSelectLesson,
  enrollmentData,
  formatDuration,
}) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0 dark:border-gray-800">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-4 px-4 py-5 text-left transition-colors hover:bg-gray-50 sm:px-5 dark:hover:bg-[#080e1b]"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400">
          {String(moduleIndex + 1).padStart(2, '0')}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {module.title}
          </h3>

          <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-500">
            {module.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-gray-500 sm:block">
            {module.lessons?.length || 0} lessons
          </span>

          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-[#080e1b]/70"
          >
            {module.lessons?.map((lesson) =>
              (lesson.isBlocked && role === UserRole.ADMIN) || !lesson.isBlocked ? (
                <div
                  key={lesson.id}
                  className="border-b border-gray-200 last:border-b-0 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-500 dark:bg-[#101827]">
                      {lesson.contentType === ContentType.VIDEO ? (
                        <Play className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {lesson.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-500">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {lesson.isFreePreview && (
                        <span className="hidden rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-600 sm:inline-flex dark:text-blue-400">
                          Preview
                        </span>
                      )}

                      <span className="hidden text-xs text-gray-500 sm:block">
                        {formatDuration(lesson.duration || 0)}
                      </span>

                      {role === UserRole.STUDENT &&
                        (lesson.isFreePreview || isEnrolled) &&
                        (() => {
                          const lessonProg =
                            enrollmentData?.data?.enrollment?.lessonProgress?.find(
                              (p) => p.lessonId === lesson.id
                            );

                          const label = lessonProg?.isCompleted
                            ? 'Replay'
                            : (lessonProg?.lastWatchedSecond || 0) > 0
                              ? 'Resume'
                              : 'Watch';

                          return (
                            <button
                              type="button"
                              onClick={() => onSelectLesson(lesson.id)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-500"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              {label}
                            </button>
                          );
                        })()}

                      {role === UserRole.ADMIN && (
                        <ToggleSwitch
                          checked={blockedLessons.has(lesson.id)}
                          onChange={() => onBlockLesson(lesson.id)}
                          label="Block"
                        />
                      )}
                    </div>
                  </div>

                  {role === UserRole.STUDENT &&
                    isEnrolled &&
                    (() => {
                      const prog =
                        enrollmentData?.data?.enrollment?.lessonProgress?.find(
                          (p) => p.lessonId === lesson.id
                        );

                      const pct = prog ? Math.min(
                        100,
                        Math.max(
                          0,
                          (prog.lastWatchedSecond /
                            (prog.totalDuration || lesson.duration || 1)) *
                          100
                        )
                      )
                        : 0;

                      if (!prog && pct === 0) {
                        return null;
                      }

                      return (
                        <div className="px-4 pb-3 sm:px-5">
                          <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5 }}
                              className={`h-full rounded-full ${prog?.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                            />
                          </div>

                          {prog?.isCompleted && (
                            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-green-600 dark:text-green-500">
                              <CheckCircle className="h-3 w-3" />
                              Completed
                            </p>
                          )}
                        </div>
                      );
                    })()}
                </div>
              ) : (
                <p
                  key={lesson.id}
                  className="p-5 text-center text-sm font-medium text-red-500"
                >
                  This lesson is removed currently.
                </p>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseModuleAccordion;
