import Router from 'express'
import { adminStudentController } from "../dependencyInjection/AdminStudentContainer";
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';

const router = Router()

router.get('/allStudents',authenticate,requireRole('admin'),adminStudentController.listAll)
