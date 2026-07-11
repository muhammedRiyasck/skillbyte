import { CreateModuleDto, ModuleResponseDto } from '../dtos/ModuleDtos';

export interface ICreateModuleUseCase {
  execute(dto: CreateModuleDto): Promise<ModuleResponseDto | null>;
}
