import Router from 'express'
import { adminStudentController } from "../dependencyInjection/adminStudentContainer";
import { authenticate } from '../../../../shared/middlewares/authMiddleware';
import { requireRole } from '../../../../shared/middlewares/requireRole';

const router = Router()

router.get('/allStudents',authenticate,requireRole('admin'),adminStudentController.listAll)
