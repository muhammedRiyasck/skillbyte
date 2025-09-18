import { Request, Response } from 'express';
import { CreateBaseUseCase } from '../../application/use-cases/CreateBaseUseCase';
import { GetCourseDetailsUseCase } from '../../application/use-cases/GetCourseDetailsUseCase';
import { UpdateBaseUseCase } from '../../application/use-cases/UpdateBaseUseCase';
import { DeleteCourseUseCase } from '../../application/use-cases/DeleteCourseUseCase';
import { UpdateCourseStatusUseCase } from '../../application/use-cases/UpdateCourseStatusUseCase';
import { GetPublishedCoursesUseCase } from '../../application/use-cases/GetPublishedCoursesUseCase';
import { GetInstructorCoursesUseCase } from '../../application/use-cases/GetInstructorCoursesUseCase';
import { GetAllCoursesForAdminUseCase } from '../../application/use-cases/GetAllCoursesForAdminUseCase';
import { uploadToCloudinary } from '../../../../shared/utils/Cloudinary';
import fs from 'fs';

export class CourseController {
  constructor(
    private createCourseUseCase: CreateBaseUseCase,
    private getCourseDetailsUseCase: GetCourseDetailsUseCase,
    private updateBaseUseCase: UpdateBaseUseCase,
    private deleteCourseUseCase: DeleteCourseUseCase,
    private updateCourseStatusUseCase: UpdateCourseStatusUseCase,
    private getPublishedCoursesUseCase: GetPublishedCoursesUseCase,
    private getInstructorCoursesUseCase: GetInstructorCoursesUseCase,
    private getAllCoursesForAdminUseCase: GetAllCoursesForAdminUseCase,
  ) {}

  createBase = async (req: any, res: Response) => {
    console.log(req.body);
    const {
      title,
      thumbnail,
      subText,
      category,
      otherCategory,
      customCategory,
      courseLevel,
      language,
      access,
      price,
      description,
      tags,
      features,
    } = req.body;

    const instructorId = req.user.id;

    const course = await this.createCourseUseCase.execute({
      instructorId,
      thumbnailUrl: thumbnail,
      title,
      subText,
      category: otherCategory && customCategory ? customCategory : category,
      courseLevel,
      language,
      price: Number(price),
      features,
      description,
      duration: access,
      tags: tags ,
      status: 'draft',
    });
    console.log(course, 'created coures')
    res.status(201).json({ message: 'details added successfuly', course });
  };

  uploadThumbnail = async (req: any, res: Response) => {
    const {id} = req.params
    console.log(id,'params')
   
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      if (req.file.size > 2 * 1024 * 1024) {
        res
          .status(400)
          .json({ message: 'Thumbnail size should be less than 2mb' });
      }

      if (!req.file.mimetype.startsWith('image/')) {
        res.status(400).json({ message: 'Only image files are allowed' });
        return;
      }

      const url = await uploadToCloudinary(req.file.path, {
        folder: 'skillbyte/thumbnails',
        resourceType: 'image',
        publicId: `thumbnail_${id}`,
        overwrite: true,
      });

      this.updateBaseUseCase.execute(id,req.user.id,{thumbnailUrl: url})

      res.json({ message:'Course Base Created Successfully'});

      // Delete the local uploaded file
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting local file:', unlinkError);
      }
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  };

  updateBase = async (req: any, res: Response) => {
    try {
      const courseId = req.params.courseId;
      const instructorId = req.user.id;
      const data = req.body;

      await this.updateBaseUseCase.execute(courseId, instructorId, data);
      res.status(200).json({ message: 'Course updated successfully' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  updateCourseStatus = async (req: any, res: Response) => {
    try {
      const courseId = req.params.courseId;
      const { status } = req.body;
      const instructorId = req.user.id;

      if (!['published', 'unpublished'].includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }

      await this.updateCourseStatusUseCase.execute(
        courseId,
        instructorId,
        status,
      );
      res.status(200).json({ message: `Course ${status} successfully` });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
  getCourseById = async (req: any, res: Response) => {
    try {
      const courseId = req.params.courseId;
      const role = req.user.role; // 'instructor' or 'student'
      const course = await this.getCourseDetailsUseCase.execute(courseId, role);
      res.status(200).json(course);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  getPublishedCourses = async (req: Request, res: Response) => {
    try {
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        price: req.query.price as 'free' | 'paid',
      };

      const courses = await this.getPublishedCoursesUseCase.execute(filters);

      res.status(200).json({ courses });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getInstructorCourses = async (req: any, res: Response) => {
    try {
      const instructorId = req.user.id;

      const courses =
        await this.getInstructorCoursesUseCase.execute(instructorId);

      res.status(200).json({ courses });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getAllCourses = async (req: Request, res: Response) => {
    try {
      const filters = {
        instructorId: req.query.instructorId as string,
        status: req.query.status as string,
        category: req.query.category as string,
        search: req.query.search as string,
      };

      const courses = await this.getAllCoursesForAdminUseCase.execute(filters);
      res.status(200).json({ courses });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  deleteCourse = async (req: any, res: Response) => {
    try {
      const courseId = req.params.courseId;
      const instructorId = req.user.id;

      await this.deleteCourseUseCase.execute(courseId, instructorId);
      res.status(200).json({ message: 'Course deleted successfully.' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
