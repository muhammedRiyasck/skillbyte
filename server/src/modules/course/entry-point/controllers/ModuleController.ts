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
import { CreateModuleSchema, UpdateModuleSchema } from "../../application/dtos/ModuleDtos";
import { ModuleMapper } from "../../application/mappers/ModuleMapper";

/**
 * Interface for authenticated request with user data.
 */


export class ModuleController {
  constructor(
    private _createUseCase: ICreateModuleUseCase,
    private _courseRepo: ICourseRepository,
    private _updateModuleUseCase: IUpdateModuleUseCase,
    private _deleteModuleUseCase: IDeleteModuleUseCase
  ) {}

  /**
   * Creates a new module for a course.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  createModule = async (req: Request, res: Response): Promise<void> => {
    const authenticatedReq = req as AuthenticatedRequest;
    logger.info(`Create module attempt from IP: ${authenticatedReq.ip}`);

    const validatedData = CreateModuleSchema.parse(authenticatedReq.body);
    const instructorId = authenticatedReq.user.id;

    // Check ownership
    const course = await this._courseRepo.findById(validatedData.courseId);
    if (!course || course.instructorId !== instructorId) {
      logger.warn(`Unauthorized module creation attempt for course ${validatedData.courseId} by instructor ${instructorId}`);
      throw new HttpError("You do not own this course.", HttpStatusCode.UNAUTHORIZED);
    }
    
    const moduleEntity = ModuleMapper.toCreateEntity(validatedData);

    const module = await this._createUseCase.execute(moduleEntity);
    logger.info(`Module created successfully for course ${validatedData.courseId}`);
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
    const validatedUpdates = UpdateModuleSchema.parse(authenticatedReq.body);
    const updates = ModuleMapper.toUpdateEntity(validatedUpdates);

    await this._updateModuleUseCase.execute(moduleId, instructorId, updates);
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

    await this._deleteModuleUseCase.execute(moduleId, instructorId);
    logger.info(`Module ${moduleId} deleted successfully`);
    ApiResponseHelper.success(res, "Module deleted successfully.");
  };
}
