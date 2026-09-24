import { Request, Response } from 'express';
import { ICreateBaseUseCase } from '../../application/interfaces/ICreateBaseUseCase';
import { IGetCourseUseCase } from '../../application/interfaces/IGetCourseDetailsUseCase';
import { IUpdateBaseUseCase } from '../../application/interfaces/IUpdateBaseUseCase';
import { IDeleteCourseUseCase } from '../../application/interfaces/IDeleteCourseUseCase';
import { IUpdateCourseStatusUseCase } from '../../application/interfaces/IUpdateCourseStatusUseCase';
import { IGetPaginatedCoursesUseCase } from '../../application/interfaces/IGetPaginatedCoursesUseCase';
import { IBlockCourseUseCase } from '../../application/interfaces/IBlockCourseUseCase';
import { IUploadCourseThumbnailUseCase } from '../../application/interfaces/IUploadCourseThumbnailUseCase';
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
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { GetCategories } from '../../application/use-cases/GetCategoriesUseCase';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

/** Handles HTTP requests for course operations. */
export class CourseController {
  constructor(
    private _createCourseUseCase: ICreateBaseUseCase,
    private _getCourseDetailsUseCase: IGetCourseUseCase,
    private _updateBaseUseCase: IUpdateBaseUseCase,
    private _deleteCourseUseCase: IDeleteCourseUseCase,
    private _updateCourseStatusUseCase: IUpdateCourseStatusUseCase,
    private _getPaginatedCoursesUseCase: IGetPaginatedCoursesUseCase,
    private _getCategoriesUseCase: GetCategories,
    private _blockCourseUseCase: IBlockCourseUseCase,
    private _uploadThumbnailUseCase: IUploadCourseThumbnailUseCase,
  ) {}

  /**
   * Create base for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  createBase = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Create course base attempt from IP: ${authenticatedReq.ip}`);

    const validatedData = CreateBaseSchema.parse(authenticatedReq.body);
    const instructorId = authenticatedReq.user.id;

    const course = await this._createCourseUseCase.execute(
      validatedData,
      instructorId,
    );

    logger.info(
      `Course base created successfully for instructor ${instructorId}`,
    );
    ApiResponseHelper.created(res, 'Details added successfully', {
      id: course.id,
    });
  };

  /**
   * Upload thumbnail for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  uploadThumbnail = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { id } = authenticatedReq.params;

    if (!id) {
      throw new HttpError(
        ERROR_MESSAGES.CANT_SEE_COURSEID,
        HttpStatusCode.BAD_REQUEST,
      );
    }
    if (!authenticatedReq.file) {
      throw new HttpError(
        ERROR_MESSAGES.NO_FILE_UPLOADED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const result = await this._uploadThumbnailUseCase.execute({
      courseId: id,
      instructorId: authenticatedReq.user.id,
      filePath: authenticatedReq.file.path,
      mimeType: authenticatedReq.file.mimetype,
      fileSize: authenticatedReq.file.size,
    });

    ApiResponseHelper.success(res, 'Course Base Created Successfully', {
      id: result.id,
    });
  };

  /**
   * Update base for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  updateBase = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const id = authenticatedReq.params.id;
    const instructorId = authenticatedReq.user.id;

    const validatedData = UpdateBaseSchema.parse(authenticatedReq.body);

    await this._updateBaseUseCase.execute(id, instructorId, validatedData);
    ApiResponseHelper.success(res, 'Course updated successfully');
  };

  /**
   * Update course status for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  updateCourseStatus = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const id = authenticatedReq.params.id;
    const instructorId = authenticatedReq.user.id;

    const { status } = UpdateStatusSchema.parse(authenticatedReq.body);
    await this._updateCourseStatusUseCase.execute(id, instructorId, status);
    ApiResponseHelper.success(res, `Course ${status} successfully`);
  };

  /**
   * Block course for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  blockCourse = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const id = authenticatedReq.params.id;
    const { isBlocked } = BlockCourseSchema.parse(authenticatedReq.body);

    await this._blockCourseUseCase.execute(id, isBlocked);
    ApiResponseHelper.success(
      res,
      `Course ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
    );
  };

  /**
   * Get course by id for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
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
      throw new HttpError(
        ERROR_MESSAGES.COURSE_NOT_FOUND,
        HttpStatusCode.NOT_FOUND,
      );
    }

    ApiResponseHelper.success(res, 'Course retrieved successfully', course);
  };

  /**
   * Get published courses for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
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
      isBlocked: false,
      userId: authenticatedReq.user?.id,
      userRole: authenticatedReq.user?.role,
    });

    ApiResponseHelper.success(res, 'Courses retrieved successfully', {
      courses,
    });
  };

  /**
   * Get categories for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  getCategories = async (req: Request, res: Response): Promise<void> => {
    const categories = await this._getCategoriesUseCase.execute();
    ApiResponseHelper.success(
      res,
      'Categories retrieved successfully',
      categories,
    );
  };

  /**
   * Get instructor courses for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
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

  /**
   * Get all courses for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
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

  /**
   * Delete course for the Course entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  deleteCourse = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const id = authenticatedReq.params.id;
    const instructorId = authenticatedReq.user.id;

    await this._deleteCourseUseCase.execute(id, instructorId);
    ApiResponseHelper.success(res, 'Course deleted successfully');
  };
}
