import {  Response } from "express";
import { CreateLessonUseCase } from "../../application/use-cases/CreateLessonUseCase";
import { UpdateLessonUseCase } from "../../application/use-cases/UpdateLessonUseCase";
import { DeleteLessonUseCase } from "../../application/use-cases/DeleteLessonUseCase";
import { uploadBufferToCloudinary } from "../../../../shared/utils/Cloudinary";

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

  uploadLessonContent =  async (req: any, res: Response) => {
    try {
       if (!req.file) return res.status(400).json({ message: "No file provided" });

    // Basic type guard (optional)
    if (!req.file.mimetype.startsWith("video/")) {
      return res.status(400).json({ message: "Only video files are allowed" });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "skillbyte/lessons",
      resource_type: "video",
      public_id: req.file.originalname.replace(/\.[^.]+$/, ""), 
      //  overwrite: false,
    });

    return res.json({
      message: "Video uploaded",
      public_id: result.public_id,
      url: result.secure_url, // progressive MP4 URL (default)
      // HLS/DASH streaming (if enabled on your account/plan):
      // hls_url: result.secure_url.replace("/upload/", "/upload/f_auto,q_auto,vc_auto/").replace(/\.(mp4|mov|mkv|webm)$/, ".m3u8"),
      duration: result.duration, // seconds
      bytes: result.bytes,
      format: result.format,
      width: result.width,
      height: result.height,
    });
    } catch(error:any){
      res.status(400).json({ message: error.message });
    }
  }
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
