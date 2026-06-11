import { Request, Response } from 'express';
import fs from 'fs/promises';
import { ICreateBaseUseCase } from '../../application/interfaces/ICreateBaseUseCase';
import { IGetCourseUseCase } from '../../application/interfaces/IGetCourseDetailsUseCase';
import { IUpdateBaseUseCase } from '../../application/interfaces/IUpdateBaseUseCase';
import { IDeleteCourseUseCase } from '../../application/interfaces/IDeleteCourseUseCase';
import { IUpdateCourseStatusUseCase } from '../../application/interfaces/IUpdateCourseStatusUseCase';
import { IGetPaginatedCoursesUseCase } from '../../application/interfaces/IGetPaginatedCoursesUseCase';
import { IBlockCourseUseCase } from '../../application/interfaces/IBlockCourseUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import logger from '../../../../shared/utils/Logger';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import {
  CreateBaseSchema,
  UpdateBaseSchema,
  UpdateStatusSchema,
  PaginationQuerySchema,
  BlockCourseSchema,
} from '../validations/CourseValidation';
import { CourseMapper } from '../../application/mappers/CourseMapper';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { IEnrollmentReadRepository } from '../../../enrollment/domain/IRepositories/IEnrollmentReadRepository';
import { GetCategories } from '../../application/use-cases/GetCategoriesUseCase';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import { IEnrollment } from '../../../enrollment/domain/entities/Enrollment';
import { UserRole } from '../../../../shared/enums/UserRole';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

export class CourseController {
  constructor(
    private _createCourseUseCase: ICreateBaseUseCase,
    private _getCourseDetailsUseCase: IGetCourseUseCase,
    private _updateBaseUseCase: IUpdateBaseUseCase,
    private _deleteCourseUseCase: IDeleteCourseUseCase,
    private _updateCourseStatusUseCase: IUpdateCourseStatusUseCase,
    private _getPaginatedCoursesUseCase: IGetPaginatedCoursesUseCase,
    private _enrollmentRepository: IEnrollmentReadRepository,
    private _getCategoriesUseCase: GetCategories,
    private _blockCourseUseCase: IBlockCourseUseCase,
    private _storageService: IStorageService,
  ) {}

  createBase = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Create course base attempt from IP: ${authenticatedReq.ip}`);

    const validatedData = CreateBaseSchema.parse(authenticatedReq.body);
    const instructorId = authenticatedReq.user.id;

    const dto = CourseMapper.toCreateDto(validatedData, instructorId);
    const course = await this._createCourseUseCase.execute(dto);

    logger.info(`Course base created successfully for instructor ${instructorId}`);
    ApiResponseHelper.created(res, 'Details added successfully', { id: course.id });
  };

  uploadThumbnail = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = authenticatedReq.params;

    if (!id) {
      throw new HttpError(ERROR_MESSAGES.CANT_SEE_COURSEID, HttpStatusCode.BAD_REQUEST);
    }
    if (!authenticatedReq.file) {
      throw new HttpError(ERROR_MESSAGES.NO_FILE_UPLOADED, HttpStatusCode.BAD_REQUEST);
    }
    if (authenticatedReq.file.size > 2 * 1024 * 1024) {
      logger.warn('Thumbnail size exceeds 2MB');
      throw new HttpError(ERROR_MESSAGES.THUMBNAIL_SIZE_EXCEEDED, HttpStatusCode.BAD_REQUEST);
    }
    if (!authenticatedReq.file.mimetype.startsWith('image/')) {
      throw new HttpError(ERROR_MESSAGES.ONLY_IMAGE_FILES_ALLOWED, HttpStatusCode.BAD_REQUEST);
    }

    const url = await this._storageService.upload(authenticatedReq.file.path, {
      folder: 'skillbyte/thumbnails',
      resourceType: 'image',
      publicId: `thumbnail_${id}`,
      overwrite: true,
    });

    await this._updateBaseUseCase.execute(id, authenticatedReq.user.id, { thumbnailUrl: url });
    ApiResponseHelper.success(res, 'Course Base Created Successfully', { id });

    try {
      await fs.unlink(authenticatedReq.file.path);
    } catch (unlinkError) {
      logger.error('Error deleting local file:', unlinkError);
    }
  };

  updateBase = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const id = authenticatedReq.params.id;
    const instructorId = authenticatedReq.user.id;

    const validatedData = UpdateBaseSchema.parse(authenticatedReq.body);
    const data = CourseMapper.toUpdateDto(validatedData);

    await this._updateBaseUseCase.execute(id, instructorId, data);
    ApiResponseHelper.success(res, 'Course updated successfully');
  };

  updateCourseStatus = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const id = authenticatedReq.params.id;
    const instructorId = authenticatedReq.user.id;

    const { status } = UpdateStatusSchema.parse(authenticatedReq.body);
    await this._updateCourseStatusUseCase.execute(id, instructorId, status);
    ApiResponseHelper.success(res, `Course ${status} successfully`);
  };

  blockCourse = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const id = authenticatedReq.params.id;
    const { isBlocked } = BlockCourseSchema.parse(authenticatedReq.body);

    await this._blockCourseUseCase.execute(id, isBlocked);
    ApiResponseHelper.success(res, `Course ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
  };

  getCourseById = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const id = authenticatedReq.params.id;
    const { include } = authenticatedReq.query;
    const role = authenticatedReq.user.role || 'student';
    const userId = authenticatedReq.user.id;

    const course = await this._getCourseDetailsUseCase.execute({
      courseId: id,
      role,
      include: include as string,
      userId,
    });

    if (!course) {
      throw new HttpError(ERROR_MESSAGES.COURSE_NOT_FOUND, HttpStatusCode.NOT_FOUND);
    }

    ApiResponseHelper.success(res, 'Course retrieved successfully', course);
  };

  getPublishedCourses = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const validatedQuery = PaginationQuerySchema.parse(req.query);

    const courses = await this._getPaginatedCoursesUseCase.execute({
      status: CourseStatus.LIST,
      category: validatedQuery.category as string | undefined,
      search: validatedQuery.search,
      level: req.query.level as string | undefined,
      language: req.query.language as string | undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      sort: validatedQuery.sort,
    });

    // Check enrollment status for each course if user is a student
    if (
      authenticatedReq.user &&
      authenticatedReq.user.role === UserRole.STUDENT &&
      courses?.data
    ) {
      const userId = authenticatedReq.user.id;
      const courseIds = courses.data.map((c) => c.id).filter((id): id is string => !!id);
      const enrollments = await this._enrollmentRepository.findEnrollmentsForUser(userId, courseIds);
      const enrolledSet = new Set(enrollments.map((e: IEnrollment) => e.courseId.toString()));

      const withEnrollment = courses.data.map((c) => ({
        ...c,
        isEnrolled: enrolledSet.has(c.id || ''),
      }));

      ApiResponseHelper.success(res, 'Courses retrieved successfully', {
        courses: { ...courses, data: withEnrollment },
      });
      return;
    }

    ApiResponseHelper.success(res, 'Courses retrieved successfully', { courses });
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    const categories = await this._getCategoriesUseCase.execute();
    ApiResponseHelper.success(res, 'Categories retrieved successfully', categories);
  };

  getInstructorCourses = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;
    const validatedQuery = PaginationQuerySchema.parse(authenticatedReq.query);

    const courses = await this._getPaginatedCoursesUseCase.execute({
      instructorId,
      status: validatedQuery.status,
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      sort: validatedQuery.sort,
    });

    ApiResponseHelper.success(res, 'Courses retrieved successfully', {
      ...courses,
      data: courses?.data || [],
    });
  };

  getAllCourses = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const validatedQuery = PaginationQuerySchema.parse(authenticatedReq.query);

    const courses = await this._getPaginatedCoursesUseCase.execute({
      status: validatedQuery.status,
      category: validatedQuery.category as string | undefined,
      search: validatedQuery.search,
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      sort: validatedQuery.sort,
    });

    ApiResponseHelper.success(res, 'Courses retrieved successfully', {
      courses,
    });
  };

  deleteCourse = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const id = authenticatedReq.params.id;
    const instructorId = authenticatedReq.user.id;

    await this._deleteCourseUseCase.execute(id, instructorId);
    ApiResponseHelper.success(res, 'Course deleted successfully');
  };
}
