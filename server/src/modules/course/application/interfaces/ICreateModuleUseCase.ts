import { Module } from '../../domain/entities/Module';


export interface ICreateModuleUseCase {
  execute(dto: any): Promise<Module | null>; 
}
