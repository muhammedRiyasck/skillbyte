import { eventBus } from '../../../../../shared/services/event-bus/EventBus';
import {
  COURSE_EVENTS,
  LessonCreatedEvent,
  ModuleCreatedEvent,
  CoursePublishedEvent,
  CourseUnlistedEvent,
  EnrollmentCreatedEvent,
} from '../../../../../shared/services/event-bus/CourseEvents';
import { ICreateNotificationUseCase } from '../../../application/interfaces/ICreateNotificationUseCase';
import { IEnrollmentReadRepository } from '../../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import logger from '../../../../../shared/utils/Logger';
import { NotificationType } from '../../../../../shared/enums/NotificationType';

export class CourseNotificationListener {
  constructor(
    private createNotificationUseCase: ICreateNotificationUseCase,
    private enrollmentReadRepo?: IEnrollmentReadRepository,
  ) {
    this.registerListeners();
  }

  private registerListeners(): void {
    eventBus.on(COURSE_EVENTS.LESSON_CREATED, this.onLessonCreated.bind(this));
    eventBus.on(COURSE_EVENTS.MODULE_CREATED, this.onModuleCreated.bind(this));
    eventBus.on(
      COURSE_EVENTS.COURSE_PUBLISHED,
      this.onCoursePublished.bind(this),
    );
    eventBus.on(
      COURSE_EVENTS.COURSE_UNLISTED,
      this.onCourseUnlisted.bind(this),
    );
    // Single registration (duplicate removed)
    eventBus.on(
      COURSE_EVENTS.ENROLLMENT_CREATED,
      this.onEnrollmentCreated.bind(this),
    );
    logger.info('CourseNotificationListener registered');
  }

  private async notifyEnrolledStudents(
    courseId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
  ): Promise<void> {
    if (!this.enrollmentReadRepo) {
      logger.warn(
        'CourseNotificationListener: enrollmentReadRepo not provided, skipping bulk notify',
      );
      return;
    }

    const studentIds =
      await this.enrollmentReadRepo.findStudentIdsByCourseId(courseId);

    await Promise.allSettled(
      studentIds.map((studentId) =>
        this.createNotificationUseCase.execute({
          userId: studentId,
          title,
          message,
          type,
        }),
      ),
    );
  }

  private async onLessonCreated(payload: unknown): Promise<void> {
    const event = payload as LessonCreatedEvent;
    try {
      await this.notifyEnrolledStudents(
        event.courseId,
        'New Lesson Available',
        `A new lesson "${event.lessonTitle}" has been added to "${event.courseTitle}".`,
      );
    } catch (error) {
      logger.error('CourseNotificationListener: onLessonCreated failed', error);
    }
  }

  private async onModuleCreated(payload: unknown): Promise<void> {
    const event = payload as ModuleCreatedEvent;
    try {
      await this.notifyEnrolledStudents(
        event.courseId,
        'New Module Available',
        `A new module "${event.moduleTitle}" has been added to "${event.courseTitle}".`,
      );
    } catch (error) {
      logger.error('CourseNotificationListener: onModuleCreated failed', error);
    }
  }

  private async onCoursePublished(payload: unknown): Promise<void> {
    const event = payload as CoursePublishedEvent;
    try {
      await this.notifyEnrolledStudents(
        event.courseId,
        'Course Published',
        `The course "${event.courseTitle}" is now live and available!`,
        NotificationType.SUCCESS,
      );
    } catch (error) {
      logger.error(
        'CourseNotificationListener: onCoursePublished failed',
        error,
      );
    }
  }

  private async onCourseUnlisted(payload: unknown): Promise<void> {
    const event = payload as CourseUnlistedEvent;
    try {
      await this.notifyEnrolledStudents(
        event.courseId,
        'Course Unlisted',
        `The course "${event.courseTitle}" has been unlisted by the instructor.`,
        NotificationType.WARNING,
      );
    } catch (error) {
      logger.error(
        'CourseNotificationListener: onCourseUnlisted failed',
        error,
      );
    }
  }

  private async onEnrollmentCreated(payload: unknown): Promise<void> {
    const event = payload as EnrollmentCreatedEvent;
    try {
      await this.createNotificationUseCase.execute({
        userId: event.instructorId,
        title: 'New Student Enrolled',
        message: `A student has enrolled in your course "${event.courseTitle}".`,
        type: NotificationType.SUCCESS,
      });
    } catch (error) {
      logger.error(
        'CourseNotificationListener: onEnrollmentCreated failed',
        error,
      );
    }
  }
}
