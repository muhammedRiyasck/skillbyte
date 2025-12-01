import { Request, Response } from 'express';
import fs from 'fs';
import { uploadToCloudinary } from '../../../../shared/utils/Cloudinary';
import { ICreateBaseUseCase } from '../../application/interfaces/ICreateBaseUseCase';
import { IGetCourseUseCase } from '../../application/interfaces/IGetCourseDetailsUseCase';
import { IUpdateBaseUseCase } from '../../application/interfaces/IUpdateBaseUseCase';
import { IDeleteCourseUseCase } from '../../application/interfaces/IDeleteCourseUseCase';
import { IUpdateCourseStatusUseCase } from '../../application/interfaces/IUpdateCourseStatusUseCase';
import { IGetPaginatedCoursesUseCase } from '../../application/interfaces/IGetPaginatedCoursesUseCase';
import { IGetAllCoursesForAdminUseCase } from '../../application/interfaces/IGetAllCoursesForAdminUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import logger from '../../../../shared/utils/Logger';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import {
  CreateBaseSchema,
  UpdateBaseSchema,
  UpdateStatusSchema,
  CourseIdParamSchema,
  PaginationQuerySchema,
  GetCourseQuerySchema,
  type CreateBaseValidationType,
  type UpdateBaseValidationType,
  type UpdateStatusValidationType,
  type CourseIdParamValidationType,
  type PaginationQueryValidationType,
  type GetCourseQueryValidationType,
} from '../../application/dtos/CourseValidationSchemas';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { custom } from 'zod';
import { duration } from 'zod/v4/classic/iso.cjs';

export class CourseController {
  constructor(
    private _createCourseUseCase: ICreateBaseUseCase,
    private _getCourseDetailsUseCase: IGetCourseUseCase,
    private _updateBaseUseCase: IUpdateBaseUseCase,
    private _deleteCourseUseCase: IDeleteCourseUseCase,
    private _updateCourseStatusUseCase: IUpdateCourseStatusUseCase,
    private _getPaginatedCoursesUseCase: IGetPaginatedCoursesUseCase,
    private _getAllCoursesForAdminUseCase: IGetAllCoursesForAdminUseCase,
  ) {}

  /**
   * Creates the base details for a new course.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  createBase = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Create course base attempt from IP: ${authenticatedReq.ip}`);
    const validatedData = CreateBaseSchema.parse(authenticatedReq.body);
    const {
      title,
      thumbnail,
      subText,
      category,
      customCategory,
      courseLevel,
      language,
      access,
      price,
      description,
      tags,
      features,
    } = validatedData;

    const instructorId = authenticatedReq.user.id;
    const course = await this._createCourseUseCase.execute({
      instructorId,
      thumbnailUrl: thumbnail || null,
      title,
      subText: subText || '',
      category: customCategory ? customCategory : category || '',
      courseLevel: courseLevel || '',
      language: language || '',
      price: Number(price) || 0,
      features: features || [],
      description: description || '',
      duration: access || '',
      tags: tags || [],
      status: 'draft',
    });

    logger.info(
      `Course base created successfully for instructor ${instructorId}`,
    );
    ApiResponseHelper.created(res, 'Details added successfully', {
      courseId: course.courseId,
    });
  };

  /**
   * Uploads a thumbnail image for a course.
   * Validates the course ID, file presence, size, and type, then uploads to Cloudinary and updates the course.
   * @param req - Authenticated request object with file upload.
   * @param res - Express response object.
   * @throws HttpError if validation fails.
   */
  uploadThumbnail = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const { courseId } = authenticatedReq.params;
    if (!courseId) {
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

    if (authenticatedReq.file.size > 2 * 1024 * 1024) {
      logger.warn('Thumbnail size exceeds 2MB');
      throw new HttpError(
        ERROR_MESSAGES.THUMBNAIL_SIZE_EXCEEDED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (!authenticatedReq.file.mimetype.startsWith('image/')) {
      throw new HttpError(
        ERROR_MESSAGES.ONLY_IMAGE_FILES_ALLOWED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const url = await uploadToCloudinary(authenticatedReq.file.path, {
      folder: 'skillbyte/thumbnails',
      resourceType: 'image',
      publicId: `thumbnail_${courseId}`,
      overwrite: true,
    });

    await this._updateBaseUseCase.execute(courseId, authenticatedReq.user.id, {
      thumbnailUrl: url,
    });

    ApiResponseHelper.success(res, 'Course Base Created Successfully', {
      courseId,
    });

    // Delete the local uploaded file
    try {
      await fs.promises.unlink(authenticatedReq.file.path);
    } catch (unlinkError) {
      logger.error('Error deleting local file:', unlinkError);
    }
  };

  /**
   * Updates the base details of a course.
   * @param req - Authenticated request object with course ID and update data.
   * @param res - Express response object.
   * @throws HttpError if update fails.
   */
  updateBase = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const courseId = authenticatedReq.params.courseId;
    const instructorId = authenticatedReq.user.id;
    const data = {
      ...authenticatedReq.body,
      duration: authenticatedReq.body.access,
      category: authenticatedReq.body.customCategory
        ? authenticatedReq.body.customCategory
        : authenticatedReq.body.category,
    };

    await this._updateBaseUseCase.execute(courseId, instructorId, data);
    ApiResponseHelper.success(res, 'Course updated successfully');
  };

  /**
   * Updates the status of a course (list or unlist).
   * @param req - Authenticated request object with course ID and status.
   * @param res - Express response object.
   * @throws HttpError if status is invalid or update fails.
   */
  updateCourseStatus = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const courseId = authenticatedReq.params.courseId;
    const { status } = authenticatedReq.body;
    const instructorId = authenticatedReq.user.id;

    if (!['list', 'unlist'].includes(status)) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_STATUS,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    await this._updateCourseStatusUseCase.execute(
      courseId,
      instructorId,
      status,
    );
    ApiResponseHelper.success(res, `Course ${status} successfully`);
  };

  /**
   * Retrieves a course by its ID, considering the user's role for access control.
   * @param req - Authenticated request object with course ID and optional include query.
   * @param res - Express response object.
   */
  getCourseById = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const courseId = authenticatedReq.params.courseId;
    const { include } = authenticatedReq.query;
    const role = authenticatedReq.user.role || 'student';
    const course = await this._getCourseDetailsUseCase.execute(
      courseId,
      role,
      include as string,
    );
    ApiResponseHelper.success(res, 'Course retrieved successfully', course);
  };

  /**
   * Retrieves published courses with pagination and sorting.
   * @param req - Request object with optional page, limit, and sort query parameters.
   * @param res - Express response object.
   */
  getPublishedCourses = async (req: Request, res: Response): Promise<void> => {
    const query = { status: 'list' };
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (typeof req.query.sort === 'string') {
      const [field, dir] = (req.query.sort as string).split(':');
      sort = { [field]: dir === 'asc' ? 1 : -1 };
    }

    const courses = await this._getPaginatedCoursesUseCase.execute(
      query,
      page,
      limit,
      sort,
    );

    ApiResponseHelper.success(res, 'Courses retrieved successfully', {
      courses,
    });
  };

  /**
   * Retrieves courses for the authenticated instructor with optional status filtering, pagination, and sorting.
   * @param req - Authenticated request object with optional status, page, limit, and sort query parameters.
   * @param res - Express response object.
   */
  getInstructorCourses = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;

    const status = authenticatedReq.query.status as string;
    const page = Number(authenticatedReq.query.page) || 1;
    const limit = Number(authenticatedReq.query.limit) || 6;
    let query: Record<string, any> = { instructorId };

    // Filter by status if provided
    if (status === 'Drafted Courses') {
      query.status = 'draft';
    } else if (status === 'Listed Courses') {
      query.status = 'list';
    } else if (status === 'Unlisted Courses') {
      query.status = 'unlist';
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (typeof authenticatedReq.query.sort === 'string') {
      const [field, dir] = (authenticatedReq.query.sort as string).split(':');
      sort = { [field]: dir === 'asc' ? 1 : -1 };
    }

    const courses = await this._getPaginatedCoursesUseCase.execute(
      query,
      page,
      limit,
      sort,
    );

    ApiResponseHelper.success(res, 'Courses retrieved successfully', courses);
  };

  /**
   * Retrieves all courses for admin with optional filters.
   * @param req - Request object with optional instructorId, status, category, and search query parameters.
   * @param res - Express response object.
   */
  getAllCourses = async (req: Request, res: Response): Promise<void> => {
    const filters = {
      instructorId: req.query.instructorId as string,
      status: req.query.status as string,
      category: req.query.category as string,
      search: req.query.search as string,
    };

    const courses = await this._getAllCoursesForAdminUseCase.execute(filters);
    ApiResponseHelper.success(res, 'Courses retrieved successfully', {
      courses,
    });
  };

  /**
   * Deletes a course by its ID for the authenticated instructor.
   * @param req - Authenticated request object with course ID.
   * @param res - Express response object.
   * @throws HttpError if deletion fails.
   */
  deleteCourse = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const courseId = authenticatedReq.params.courseId;
    const instructorId = authenticatedReq.user.id;

    await this._deleteCourseUseCase.execute(courseId, instructorId);
    ApiResponseHelper.success(res, 'Course deleted successfully');
  };
}
