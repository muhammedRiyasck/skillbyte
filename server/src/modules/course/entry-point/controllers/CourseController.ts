import { Request, Response } from "express";
import { CreateBaseUseCase } from "../../application/use-cases/CreateBase";
import { GetCourseDetailsUseCase } from "../../application/use-cases/GetCourseDetails";
import { UpdateBaseUseCase } from "../../application/use-cases/UpdateBase";
import { DeleteCourseUseCase } from "../../application/use-cases/DeleteCourseUseCase";
import { UpdateCourseStatusUseCase } from "../../application/use-cases/UpdateCourseStatusUseCase";
import { GetPublishedCoursesUseCase } from "../../application/use-cases/GetPublishedCoursesUseCase";
import { GetInstructorCoursesUseCase } from "../../application/use-cases/GetInstructorCourses";
import { GetAllCoursesForAdminUseCase } from "../../application/use-cases/GetAllCoursesForAdminUseCase";
// import { IAuthenticatedRequest } from "../../../../shared/interfaces/IAuthenticatedRequest";

export class CourseController {
  constructor(private createCourseUseCase: CreateBaseUseCase,
              private getCourseDetailsUseCase: GetCourseDetailsUseCase,
              private updateBaseUseCase: UpdateBaseUseCase,
              private deleteCourseUseCase: DeleteCourseUseCase,
              private updateCourseStatusUseCase: UpdateCourseStatusUseCase,
              private getPublishedCoursesUseCase: GetPublishedCoursesUseCase,
              private getInstructorCoursesUseCase: GetInstructorCoursesUseCase,
              private getAllCoursesForAdminUseCase: GetAllCoursesForAdminUseCase
  ) {}

   createBase = async (req: any, res: Response) => {
    const { title, description, thumbnailUrl, price, category, tags } = req.body;
    const instructorId = req.user.id; 

    const course = await this.createCourseUseCase.execute({
      instructorId,
      title,
      description,
      thumbnailUrl,
      price,
      category,
      tags
    });

    res.status(201).json({ message: "Course created successfully", course });
  };

  updateBase = async (req: any, res: Response)=> {
   try {
     const courseId = req.params.courseId;
     const instructorId = req.user.id;
     const data = req.body;

     await this.updateBaseUseCase.excute(courseId, instructorId, data);
     res.status(200).json({ message: "Course updated successfully" });
   } catch (err: any) {
     res.status(400).json({ message: err.message });
   }
 };

 updateCourseStatus = async (req: any, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const { status } = req.body;
    const instructorId = req.user.id;

    if (!["published", "unpublished"].includes(status)) {
       res.status(400).json({ message: "Invalid status" }); return
    }

    await this.updateCourseStatusUseCase.execute(courseId, instructorId, status);
    res.status(200).json({ message: `Course ${status} successfully` });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
 }
    getCourseById = async (req: any, res: Response)=> {
    try {
      const courseId = req.params.courseId;
      const role = req.user.role; // 'instructor' or 'student'
      const course = await this.getCourseDetailsUseCase.execute(courseId,role);
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
      price: req.query.price as "free" | "paid"
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

    const courses = await this.getInstructorCoursesUseCase.execute(instructorId);

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
        search: req.query.search as string
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
    res.status(200).json({ message: "Course deleted successfully." });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
  
}
