import { Router } from "express";
const router = Router();

import { GoogleController } from "../controllers/Google.Controller";
import {commonAuthController} from '../dependencyInjection/CommonAuthContainer'
import { facebookController } from "../controllers/Facebook.Controller";

router.post("/login",commonAuthController.login);
router.get("/google",GoogleController.googleAuth);
router.get("/google/callback", GoogleController.googleCallback);
router.get("/facebook",facebookController.facebookAuth)
router.get("/facebook/callback",facebookController.facebookCallback)

router.post('/access-token',commonAuthController.refreshToken)
router.post('/resend-otp',commonAuthController.resendOtp)
router.post('/logout',commonAuthController.logout)

export default router;
