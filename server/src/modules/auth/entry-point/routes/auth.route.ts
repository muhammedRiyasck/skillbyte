import { Router } from "express";
const router = Router();

import { GoogleController } from "../controllers/google.controller";
import {authContainer} from '../dependencyInjection/CommonAuthContainer'
import { facebookController } from "../controllers/facebook.controller";

router.post("/login",authContainer.login);
router.get("/google",GoogleController.googleAuth);
router.get("/google/callback", GoogleController.googleCallback);
router.get("/facebook",facebookController.facebookAuth)
router.get("/facebook/callback",facebookController.facebookCallback)

router.post('/access-token',authContainer.refreshToken)
router.post('/resend-otp',authContainer.resendOtp)
router.post('/logout',authContainer.logout)

export default router;
