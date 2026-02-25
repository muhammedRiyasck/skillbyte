export const COURSE_EVENTS = {
  LESSON_CREATED: 'course:lesson_created',
  MODULE_CREATED: 'course:module_created',
  COURSE_PUBLISHED: 'course:published',
  COURSE_UNLISTED: 'course:unlisted',
  ENROLLMENT_CREATED: 'course:enrollment_created',
} as const;

export interface LessonCreatedEvent {
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  instructorId: string;
}

export interface ModuleCreatedEvent {
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  instructorId: string;
}

export interface CoursePublishedEvent {
  courseId: string;
  courseTitle: string;
  instructorId: string;
}

export interface CourseUnlistedEvent {
  courseId: string;
  courseTitle: string;
  instructorId: string;
}

export interface EnrollmentCreatedEvent {
  courseId: string;
  courseTitle: string;
  studentId: string;
  instructorId: string;
}
