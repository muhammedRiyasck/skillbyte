import { Module } from '../../domain/entities/Module';
import { CreateModuleDTO } from "../dtos/CreateModuleDTO";

export interface ICreateModuleUseCase {
  execute(dto: CreateModuleDTO): Promise<Module | null>;
}
