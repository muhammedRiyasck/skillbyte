import express from "express";
import path from 'path'
import session from "express-session";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";


import { config } from "dotenv";
config();

const app = express();
app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret_change_in_prod",
  resave: false,
  saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());

import "./shared/config/passport/GoogleStrategy"; 
import "./shared/config/passport/FacebookStrategy"

import errorHandler from "./shared/middlewares/GlobalErrorMiddleware";
import EnrollmentRoutes from "./modules/enrollment/entry-point/routes/Enrollment.routes";
import { EnrollmentController } from "./modules/enrollment/entry-point/EnrollmentController";

const enrollmentController = new EnrollmentController();

// Webhook must be before express.json() to capture raw body
app.post("/api/enrollment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    await enrollmentController.handleWebhook(req, res);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: ['http://localhost:5173','http://192.168.1.2:5173'], // allowed origins
  methods: ['GET', 'get', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true // allow cookies or authorization headers
};
app.use(cors(corsOptions));
app.use(cookieParser())

app.use("/assets", express.static(path.join(__dirname, "../assets")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
  standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
});

app.use(limiter);

import AuthRoutes from "./modules/auth/entry-point/routes/Auth.Routes";
import AdminAuthRoutes from "./modules/admin/entry-points/routes/Auth.routes";
import StudentauthRoutes from "./modules/student/entry-points/routes/Auth.routes";
import AdminStudentRoutes from "./modules/student/entry-points/routes/AdminStudent.routes";
import InstructorauthRoutes from "./modules/instructor/entry-point/routes/Auth.Routes";
import InstructorProfileRoutes from "./modules/instructor/entry-point/routes/InstructorProfile.routes";
import AdminInstructorRoutes from './modules/instructor/entry-point/routes/AdminInstructor.Routes'
import CourseRoutes from "./modules/course/entry-point/routes/Course.routes";
// import AdminCourseRoutes from "./modules/course/entry-point/routes/AdminCourse.Routes";
// Load auth routes
app.use("/api/auth", AuthRoutes);

app.use("/api/student", StudentauthRoutes);
app.use("/api/students", AdminStudentRoutes)

app.use("/api/instructor", InstructorauthRoutes);
app.use("/api/instructor", InstructorProfileRoutes);
app.use("/api/instructors/", AdminInstructorRoutes)

app.use("/api/course", CourseRoutes);
app.use("/api/enrollment", EnrollmentRoutes);

app.use("/api/admin", AdminAuthRoutes);

app.use(errorHandler)
export default app;

