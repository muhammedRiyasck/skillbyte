import { fiveMinLimit } from "../../../../shared/utils/RateLimiter";
import { adminAuthContainer } from "../dependencyInjection/AdminAuthContainer";
import { Router } from "express";
const router = Router();

router.post('/login',fiveMinLimit(10,'login'),adminAuthContainer.login)

export default router;
