import asyncHandler from "../../../../shared/utils/AsyncHandler";
import { CustomLimit } from "../../../../shared/utils/RateLimiter";
import { adminAuthContainer } from "../dependencyInjection/AdminAuthContainer";
import { Router } from "express";
const router = Router();

router.post('/login',CustomLimit(10,'login'),asyncHandler(adminAuthContainer.login))

export default router;
