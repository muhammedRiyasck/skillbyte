import Queue from 'bull';
import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';
import {
  JOB_NAMES,
  QUEUE_NAMES,
} from '../../../../shared/services/job-queue/JobTypes';
import {
  VideoTranscodeProcessor,
  VideoTranscodeJobData,
} from '../../../../shared/services/job-queue/processors/VideoTranscodeProcessor';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  COURSE_EVENTS,
  LessonCreatedEvent,
} from '../../../../shared/services/event-bus/CourseEvents';
import logger from '../../../../shared/utils/Logger';

/**
 * Registers all background job processors and event-bus subscriptions
 * that belong to the Course module.
 *
 * Keeping this inside the course module means JobQueueInitializer no longer
 * needs to know about course-domain internals (OCP / SRP).
 */
export function registerCourseJobs(): void {
  // Wire VideoTranscode processor (static processor, registered inline)
  jobQueueService.processJob(
    QUEUE_NAMES.COURSE,
    JOB_NAMES.VIDEO_TRANSCODE,
    (job: Queue.Job<VideoTranscodeJobData>) =>
      VideoTranscodeProcessor.process(job),
  );

  // Subscribe to domain event → enqueue video transcode job
  eventBus.on(COURSE_EVENTS.LESSON_CREATED, (event: LessonCreatedEvent) => {
    if (event.contentType === 'video' && event.lessonId && event.fileName) {
      jobQueueService
        .addJob(
          QUEUE_NAMES.COURSE,
          JOB_NAMES.VIDEO_TRANSCODE,
          {
            lessonId: event.lessonId,
            sourceKey: event.fileName,
          },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
          },
        )
        .catch((err: unknown) =>
          logger.error('Failed to enqueue video-transcode job:', err),
        );
    }
  });

  logger.info('Course job processors registered');
}
