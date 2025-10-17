import Router from 'express'
import { adminStudentController } from "../dependencyInjection/AdminStudentContainer";
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
const router = Router()

import asyncHandler from '../../../../shared/utils/AsyncHandler';

router.get('/allStudents',authenticate,requireRole('admin'),asyncHandler(adminStudentController.listAll))
router.patch('/change-status',authenticate,requireRole('admin'),asyncHandler(adminStudentController.changeStatus))

export default router;
