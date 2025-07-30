import {  Response } from "express";
import { CreateLessonUseCase } from "../../application/use-cases/CreateLesson";
import { UpdateLessonUseCase } from "../../application/use-cases/UpdateLessonUseCase";
import { DeleteLessonUseCase } from "../../application/use-cases/DeleteLessonUseCase";

export class LessonController {
  constructor(
    private createUseCase: CreateLessonUseCase ,
     private updateUseCase:UpdateLessonUseCase ,
    private deleteUseCase: DeleteLessonUseCase
     ) {}

  createLesson = async (req: any, res: Response) => {
    try {
      const instructorId = req.user.id;
      const { moduleId, title, contentType, contentUrl, order } = req.body;

      await this.createUseCase.execute({
        moduleId,
        instructorId,
        title,
        contentType,
        contentUrl,
        order
      });

      res.status(201).json({ message: "Lesson created successfully." });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  updateLesson = async (req: any, res: Response) => {
    try {
      const lessonId = req.params.lessonId;
      const instructorId = req.user.id;
      const updates = req.body;

      await this.updateUseCase.execute(lessonId, instructorId, updates);
      res.status(200).json({ message: "Lesson updated successfully" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  deleteLesson = async (req: any, res: Response) => {
    try {
      const lessonId = req.params.lessonId;
      const instructorId = req.user.id;

      await this.deleteUseCase.execute(lessonId, instructorId);
      res.status(200).json({ message: "Lesson deleted successfully." });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
