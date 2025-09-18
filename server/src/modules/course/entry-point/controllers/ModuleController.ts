import {  Response } from "express";
import { CreateModuleWithLessonsUseCase } from "../../application/use-cases/CreateModuleWithLessonsUseCase";
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { UpdateModuleUseCase } from "../../application/use-cases/UpdateModuleUseCase";
import { DeleteModuleUseCase } from "../../application/use-cases/DeleteModuleUseCase";

export class ModuleWithLessonController {
  constructor(
    private createUseCase: CreateModuleWithLessonsUseCase,
    private courseRepo: ICourseRepository, 
    private updateModuleUseCase: UpdateModuleUseCase,
    private deleteModuleUseCase : DeleteModuleUseCase

  ) {}

  createModuleWithLessons = async (req: any, res: Response) => {
    const instructorId = req.user.id;
    const { courseId, title, description, order, lessons } = req.body;

    // 🔒 Verify course ownership
    const course = await this.courseRepo.findById(courseId);
    if (!course || course.instructorId !== instructorId) {
       res.status(403).json({ message: "You do not own this course." }); return
    }

    await this.createUseCase.execute({ courseId, title, description, order, lessons });
    res.status(201).json({ message: "Module and lessons added." });
  };

    updateModule = async (req: any, res: Response) => {
    try {
      const moduleId = req.params.moduleId;
      const instructorId = req.user.id;
      const updates = req.body;

      await this.updateModuleUseCase.execute(moduleId, instructorId, updates);
      res.status(200).json({ message: "Module updated successfully" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  deleteModule = async (req: any, res: Response) => {
    try {
      const moduleId = req.params.moduleId;
      const instructorId = req.user.id;

      await this.deleteModuleUseCase.execute(moduleId, instructorId);
      res.status(200).json({ message: "Module deleted successfully." });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

}
