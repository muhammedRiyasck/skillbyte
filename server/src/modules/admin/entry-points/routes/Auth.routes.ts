import { adminAuthContainer } from "../dependencyInjection/AdminAuthContainer";
import { Router } from "express";
const router = Router();

router.post('/login',adminAuthContainer.login)

export default router;
