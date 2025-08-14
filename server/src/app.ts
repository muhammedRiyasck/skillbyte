import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";

import { config } from "dotenv";
config();

const app = express();
app.use(session({
  secret: "some_secret_key", 
  resave: false,
  saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());

import "./shared/config/passport/GoogleStrategy"; 
import "./shared/config/passport/FacebookStrategy"

import errorHandler from "./shared/middlewares/GlobalErrorMiddleware";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: ['http://localhost:5173','http://192.168.1.2:5173'], // allowed origins
  methods: ['GET', 'get', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true // allow cookies or authorization headers
};
app.use(cors(corsOptions));
app.use(cookieParser())


import AuthRoutes from "./modules/auth/entry-point/routes/Auth.Routes";
import AdminAuthRoutes from "./modules/admin/entry-points/routes/Auth.Routes";
import StudentauthRoutes from "./modules/student/entry-points/routes/Auth.Routes";
import AdminStudentRoutes from "./modules/student/entry-points/routes/AdminStudent.routes";
import InstructorauthRoutes from "./modules/instructor/entry-point/routes/Auth.Routes";
import AdminInstructorRoutes from './modules/instructor/entry-point/routes/AdminInstructor.routes'
import CourseRoutes from "./modules/course/entry-point/routes/Course.Routes";
// import AdminCourseRoutes from "./modules/course/entry-point/routes/AdminCourse.Routes";
// Load auth routes
app.use("/api/auth", AuthRoutes);

app.use("/api/student", StudentauthRoutes);

app.use("/api/instructor", InstructorauthRoutes);

app.use("/api/instructors/", AdminInstructorRoutes)

app.use("/api/course", CourseRoutes);

app.use("/api/admin", AdminAuthRoutes);

app.use(errorHandler)
export default app;

