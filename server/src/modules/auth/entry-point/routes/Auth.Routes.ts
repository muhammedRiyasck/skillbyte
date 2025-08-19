import { Router } from "express";
const router = Router();

import { GoogleController } from "../controllers/Google.Controller";
import { authenticate } from "../../../../shared/middlewares/AuthMiddleware";
import {commonAuthController} from '../dependencyInjection/CommonAuthContainer'
import { facebookController } from "../controllers/Facebook.Controller";

import asyncHandler from "../../../../shared/utils/AsyncHandler";
import { requireRole } from "../../../../shared/middlewares/RequireRole";

router.post("/login",requireRole('student','instructor'),asyncHandler(commonAuthController.login));
router.get("/me",authenticate,commonAuthController.amILoggedIn);
router.get("/google",GoogleController.googleAuth);
router.get("/google/callback", GoogleController.googleCallback);
router.get("/facebook",facebookController.facebookAuth)
router.get("/facebook/callback",facebookController.facebookCallback)

router.post('/access-token',commonAuthController.refreshToken)
router.post('/resend-otp',asyncHandler(commonAuthController.resendOtp))
router.post('/forgot-password',asyncHandler(commonAuthController.forgotPassword))
router.post('/reset-password',asyncHandler(commonAuthController.resetPassword))
router.post('/logout',commonAuthController.logout)

export default router;
