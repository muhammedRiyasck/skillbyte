import { Request, Response } from 'express';
import fs from 'fs';
import { uploadToCloudinary } from '../../../../shared/utils/Cloudinary';
import { ICreateBaseUseCase } from '../../application/interfaces/ICreateBaseUseCase';
import { IGetCourseUseCase } from '../../application/interfaces/IGetCourseDetailsUseCase';
import { IUpdateBaseUseCase } from '../../application/interfaces/IUpdateBaseUseCase';
import { IDeleteCourseUseCase } from '../../application/interfaces/IDeleteCourseUseCase';
import { IUpdateCourseStatusUseCase } from '../../application/interfaces/IUpdateCourseStatusUseCase';
import { IGetPaginatedCoursesUseCase } from '../../application/interfaces/IGetPaginatedCoursesUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import logger from '../../../../shared/utils/Logger';
import { AuthenticatedRequest } from '../../../../shared/types/AuthenticatedRequestType';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import {
  CreateBaseSchema,
  UpdateBaseSchema,
  UpdateStatusSchema,
  PaginationQuerySchema
} from '../../application/dtos/CourseDetailsDtos';
import { CourseMapper } from '../../application/mappers/CourseMapper';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { IEnrollmentRepository } from '../../../enrollment/domain/IEnrollmentRepository';
import { GetCategories } from '../../application/use-cases/GetCategoriesUseCase';

export class CourseController {
  constructor(
    private _createCourseUseCase: ICreateBaseUseCase,
    private _getCourseDetailsUseCase: IGetCourseUseCase,
    private _updateBaseUseCase: IUpdateBaseUseCase,
    private _deleteCourseUseCase: IDeleteCourseUseCase,
    private _updateCourseStatusUseCase: IUpdateCourseStatusUseCase,
    private _getPaginatedCoursesUseCase: IGetPaginatedCoursesUseCase,
    private _enrollmentRepository: IEnrollmentRepository,
    private _getCategoriesUseCase: GetCategories,
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
    const instructorId = authenticatedReq.user.id;
    
    const courseEntity = CourseMapper.toCreateBaseEntity(validatedData, instructorId, validatedData.thumbnail || undefined);

    const course = await this._createCourseUseCase.execute(courseEntity);

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
    
    // We can use UpdateBaseSchema if needed, or stick to any as it's partial updates
    const validatedData = UpdateBaseSchema.parse(authenticatedReq.body);
    const data = CourseMapper.toUpdateBaseEntity(validatedData);

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
    const instructorId = authenticatedReq.user.id;

    const validatedData = UpdateStatusSchema.parse(authenticatedReq.body);
    const { status } = validatedData; // status is typed now

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
    const userId = authenticatedReq.user.id;
    const course = await this._getCourseDetailsUseCase.execute(
      courseId,
      role,
      include as string,
      userId,
    );
    ApiResponseHelper.success(res, 'Course retrieved successfully', course);
  };

  /**
   * Retrieves published courses with pagination and sorting.
   * @param req - Request object with optional page, limit, and sort query parameters.
   * @param res - Express response object.
   */
  getPublishedCourses = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const validatedQuery = PaginationQuerySchema.parse(req.query);
    
    const query: any = { status: 'list' };
    const page = validatedQuery.page || 1;
    const limit = validatedQuery.limit || 6;
    const { category, courseLevel: level, language, search } = req.query; // Assuming validation doesn't strip extra fields unless strict

    // Re-applying logic with validated query or existing logic
    // The PaginationQuerySchema handles basic pagination. 
    // Complex filters might need bigger schema or manual building as before.
    
    if (validatedQuery.category) {
      query.category = { $regex: validatedQuery.category, $options: 'i' };
    }
    
    // Schema had 'category' but maybe not 'level' etc. 
    // Let's stick to using the schema for pagination and generic fields, and merge manual filters if schema is incomplete
    
    if (level) {
        query.courseLevel = { $regex: level as string, $options: 'i' };
    }
     if (language) {
      query.language = { $regex: language as string, $options: 'i' };
    }
    
    const { minPrice, maxPrice } = req.query;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (validatedQuery.search) {
       query.$or = [
        { title: { $regex: validatedQuery.search, $options: 'i' } },
        { tags: { $regex: validatedQuery.search, $options: 'i' } }
      ];
    }
    
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
     if (validatedQuery.sort) {
      const [field, dir] = validatedQuery.sort.split(':');
      if (field === 'price') {
        sort = { price: dir === 'asc' ? 1 : -1 };
      } else if (field === 'title') {
        sort = { title: dir === 'asc' ? 1 : -1 };
      } else {
        sort = { [field]: dir === 'asc' ? 1 : -1 };
      }
    }

    const courses = await this._getPaginatedCoursesUseCase.execute(
      query,
      page,
      limit,
      sort,
    );

    // Check enrollment status for each course if user is a student
    if (authenticatedReq.user && authenticatedReq.user.role === 'student' && courses && courses.data) {
      const userId = authenticatedReq.user.id;
      
      const courseIds = courses.data.map((course: any) => course._id);
      const enrollments = await this._enrollmentRepository.findEnrollmentsForUser(userId, courseIds);
      
      const enrolledCourseIdSet = new Set(enrollments.map(e => e.courseId.toString()));

      courses.data = courses.data.map((course: any) => ({
        ...course,
        isEnrolled: enrolledCourseIdSet.has(course._id.toString())
      }));
    }

    ApiResponseHelper.success(res, 'Courses retrieved successfully', {
      courses,
    });
  };

    /**
   * Retrieves all unique categories from courses.
   * @param req - Request object.
   * @param res - Express response object.
   */
  getCategories = async (req: Request, res: Response): Promise<void> => {
    const categories = await this._getCategoriesUseCase.execute();
    ApiResponseHelper.success(res, 'Categories retrieved successfully', categories);
  };


  /**
   * Retrieves courses for the authenticated instructor with optional status filtering, pagination, and sorting.
   * @param req - Authenticated request object with optional status, page, limit, and sort query parameters.
   * @param res - Express response object.
   */
  getInstructorCourses = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    const instructorId = authenticatedReq.user.id;
    const validatedQuery = PaginationQuerySchema.parse(authenticatedReq.query);

    const status = validatedQuery.status;
    const page = validatedQuery.page || 1;
    const limit = validatedQuery.limit || 6;
    let query: Record<string, any> = { instructorId };

    // Filter by status if provided
    if (status) { // Assuming schema allows status strings
         if (status === 'Drafted Courses') {
            query.status = 'draft';
        } else if (status === 'Listed Courses') {
            query.status = 'list';
        } else if (status === 'Unlisted Courses') {
            query.status = 'unlist';
        }
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (validatedQuery.sort) {
       const [field, dir] = validatedQuery.sort.split(':');
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
     const authenticatedReq = req as AuthenticatedRequest;
     const validatedQuery = PaginationQuerySchema.parse(authenticatedReq.query);

    const status = validatedQuery.status;
    const page = validatedQuery.page || 1;
    const limit = validatedQuery.limit || 6;
    let query: Record<string, string> = {};

    // Filter by status if provided
    if (status) {
        if (status === 'Drafted Courses') {
            query.status = 'draft';
          } else if (status === 'Listed Courses') {
            query.status = 'list';
          } else if (status === 'Unlisted Courses') {
            query.status = 'unlist';
          }
    }
    console.log('Query Status:', query.status);

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (validatedQuery.sort) {
       const [field, dir] = validatedQuery.sort.split(':');
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
