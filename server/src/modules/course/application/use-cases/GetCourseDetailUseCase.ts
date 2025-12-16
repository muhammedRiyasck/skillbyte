import { ICourseRepository } from '../../domain/IRepositories/ICourseRepository';
import { IModuleRepository } from '../../domain/IRepositories/IModuleRepository';
import { ILessonRepository } from '../../domain/IRepositories/ILessonRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';

import { Course } from '../../domain/entities/Course';
import { IGetCourseUseCase } from '../interfaces/IGetCourseDetailsUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';

/**
 * Valid user roles for course access.
 */
type UserRole = 'instructor' | 'student' | 'admin';

/**
 * Use case for retrieving detailed course information with optional includes.
 * Handles the business logic for fetching a course with modules and lessons based on user role and include parameters.
 */
export class GetCourseDetailUseCase implements IGetCourseUseCase {
  /**
   * Constructs a new GetCourseDetailUseCase instance.
   * @param courseRepo - The repository for course data operations.
   * @param moduleRepo - The repository for module data operations.
   * @param lessonRepo - The repository for lesson data operations.
   * @param instructorRepo - The repository for instructor data operations.
   */
  constructor(
    private _courseRepo: ICourseRepository,
    private _moduleRepo: IModuleRepository,
    private _lessonRepo: ILessonRepository,
    private _instructorRepo: IInstructorRepository,
  ) {}

  /**
   * Executes the course detail retrieval logic.
   * Validates the course exists, checks user role permissions, and includes related modules/lessons if requested.
   * @param courseId - The ID of the course to retrieve.
   * @param role - The role of the user requesting the course (instructor, student, admin).
   * @param include - Optional comma-separated string of related entities to include (e.g., 'modules,lessons').
   * @param userId - The ID of the user requesting the course .
   * @returns A promise that resolves to the Course entity with optional includes, or null if not found.
   * @throws HttpError with appropriate status code if validation fails or access is denied.
   */
  async execute(
    courseId: string,
    role: UserRole,
    include?: string,
    userId?: string,
  ): Promise<Course | null> {
    // Find the course by ID
    const course = await this._courseRepo.findById(courseId);
    if (!course) {
      throw new HttpError(
        ERROR_MESSAGES.COURSE_NOT_FOUND,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Validate the user role
    const validRoles: UserRole[] = ['instructor', 'student', 'admin'];
    if (!validRoles.includes(role)) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_ROLE,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Check instructor ownership - instructors can only view their own courses
    if (role === 'instructor') {
      if (!userId || course.instructorId !== userId) {
        throw new HttpError(
          'You can only view your own courses.',
          HttpStatusCode.FORBIDDEN,
        );
      }
    }

    // Check if students can access unlisted courses
    if (role === 'student' && course.status !== 'list') {
      throw new HttpError(
        ERROR_MESSAGES.COURSE_UNLISTED_OR_NOT_AVAILABLE,
        HttpStatusCode.FORBIDDEN,
      );
    }

    // Parse include parameters
    const includeArr = include ? include.split(',') : [];

    // Include modules if requested
    if (includeArr.includes('modules')) {
      const modules = await this._moduleRepo.findModulesByCourseId(courseId);

      // Include lessons within modules if requested
      if (includeArr.includes('lessons')) {
        const moduleIds = modules.map((m) => m.moduleId!.toString());
        const lessons = await this._lessonRepo.findByModuleId(moduleIds);

        // Associate lessons with their respective modules
        // All students can see lesson metadata (titles, descriptions)
        // Access control for video playback is handled in GetLessonPlayUrlUseCase
        modules.forEach((mod) => {
          mod.lessons = lessons.filter(
            (les) => les.moduleId.toString() === mod.moduleId,
          );
        });
      }

      course.modules = modules;
    }

    // Include instructor if requested
    if (includeArr.includes('instructor')) {
      const instructor = await this._instructorRepo.findById(
        course.instructorId,
      );
      if (instructor) {
        // Attach instructor data to course
        (
          course as Course & { instructor: Record<string, unknown> }
        ).instructor = {
          name: instructor.name,
          title: instructor.jobTitle,
          avatar: instructor.profilePictureUrl,
          bio: instructor.bio,
        };
      }
    }

    return course;
  }
}
