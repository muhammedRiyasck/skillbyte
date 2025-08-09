import express from "express";
import session from "express-session";
import passport from "passport";

import { config } from "dotenv";
config();

import "./shared/config/passport/GoogleStartegy"; //  this is imported to initialize
import "./shared/config/passport/FacebookStrategy"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "some_secret_key", // store securely in .env in production
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


import AuthRoutes from "./modules/auth/entry-point/routes/Auth.Routes";
import StudentauthRoutes from "./modules/student/entry-points/routes/Auth.routes";
import InstructorauthRoutes from "./modules/instructor/entry-point/routes/Auth.Routes";
import AdminInstructorRoutes from './modules/instructor/entry-point/routes/AdminInstructor.Routes'
import AdminauthRoutes from "./modules/admin/entry-points/routes/Auth.Routes";
import CourseRoutes from "./modules/course/entry-point/routes/Course.Routes";
// Load auth routes
app.use("/api/auth", AuthRoutes);

app.use("/api/student", StudentauthRoutes);

app.use("/api/instructor", InstructorauthRoutes);

app.use("/api/instructors/", AdminInstructorRoutes)

app.use("/api/course", CourseRoutes);

app.use("/api/admin", AdminauthRoutes);

export default app;
