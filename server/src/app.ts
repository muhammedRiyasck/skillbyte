import express from "express";
import session from "express-session";
import passport from "passport";

import { config } from "dotenv";
config();
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ['http://localhost:3000', 'https://mywebsite.com'], // allowed origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true // allow cookies or authorization headers
};

app.use(cors(corsOptions));

import "./shared/config/passport/GoogleStartegy"; //  this is imported to initialize
import "./shared/config/passport/FacebookStrategy"

import Logger from "./shared/middlewares/Logger";
app.use(Logger);

app.use(session({
    secret: "some_secret_key", // store securely in .env in production
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


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

export default app;
