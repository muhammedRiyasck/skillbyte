import { Module } from '../../domain/entities/Module';

import { CreateModuleDto } from '../dtos/ModuleDtos';

export interface ICreateModuleUseCase {
  execute(dto: CreateModuleDto): Promise<Module | null>;
}
