import { Request, Response } from "express";
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { HttpStatusCode } from "../../../../shared/enums/HttpStatusCodes";
import { HttpError } from "../../../../shared/types/HttpError";
import logger from "../../../../shared/utils/Logger";
import { ICreateModuleUseCase } from "../../application/interfaces/ICreateModuleUseCase";
import { IUpdateModuleUseCase } from "../../application/interfaces/UpdateModuleUseCase ";
import { IDeleteModuleUseCase } from "../../application/interfaces/IDeleteModuleUseCase";
import { AuthenticatedRequest } from "../../../../shared/types/AuthenticatedRequestType";
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

/**
 * Interface for authenticated request with user data.
 */


export class ModuleController {
  constructor(
    private createUseCase: ICreateModuleUseCase,
    private courseRepo: ICourseRepository,
    private updateModuleUseCase: IUpdateModuleUseCase,
    private deleteModuleUseCase: IDeleteModuleUseCase
  ) {}

  /**
   * Creates a new module for a course.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  createModule = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Create module attempt from IP: ${authenticatedReq.ip}`);

    const instructorId = authenticatedReq.user.id;
    const { courseId, moduleId, title, description, order, lessons } = authenticatedReq.body;

    const course = await this.courseRepo.findById(courseId);
    if (!course || course.instructorId !== instructorId) {
      logger.warn(`Unauthorized module creation attempt for course ${courseId} by instructor ${instructorId}`);
      throw new HttpError("You do not own this course.", HttpStatusCode.UNAUTHORIZED);
    }

    const module = await this.createUseCase.execute({ courseId, moduleId, title, description, order, lessons });
    logger.info(`Module created successfully for course ${courseId}`);
    ApiResponseHelper.created(res, "Module created successfully.", module);
  };

  /**
   * Updates an existing module.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  updateModule = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Update module attempt from IP: ${authenticatedReq.ip}`);

    const moduleId = authenticatedReq.params.moduleId;
    const instructorId = authenticatedReq.user.id;
    const updates = authenticatedReq.body;

    await this.updateModuleUseCase.execute(moduleId, instructorId, updates);
    logger.info(`Module ${moduleId} updated successfully`);
    ApiResponseHelper.success(res, "Module updated successfully");
  };

  /**
   * Deletes a module.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  deleteModule = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Delete module attempt from IP: ${authenticatedReq.ip}`);

    const moduleId = authenticatedReq.params.moduleId;
    const instructorId = authenticatedReq.user.id;

    await this.deleteModuleUseCase.execute(moduleId, instructorId);
    logger.info(`Module ${moduleId} deleted successfully`);
    ApiResponseHelper.success(res, "Module deleted successfully.");
  };
}
