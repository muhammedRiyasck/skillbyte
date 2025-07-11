import express from "express";
import session from "express-session";
import passport from "passport";

import "./shared/config/passport/googleStartegy"; //  this is imported to initialize
import "./shared/config/passport/facebookStrategy"

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


import AuthRoutes from "./modules/auth/entry-point/routes/auth.route";
import StudentauthRoutes from "./modules/student/entry-points/routes/auth.routes";
import InstructorauthRoutes from "./modules/instructor/entry-point/routes/auth.route";
import AdminInstructorRoutes from './modules/instructor/entry-point/routes/adminInstructor.routes'
import AdminauthRoutes from "./modules/admin/entry-points/routes/auth.routes";
import CourseRoutes from "./modules/course/entry-point/routes/course.routes";
// Load auth routes
app.use("/api/auth", AuthRoutes);

app.use("/api/student", StudentauthRoutes);

app.use("/api/instructor", InstructorauthRoutes);

app.use("/api/instructors/", AdminInstructorRoutes)

app.use("/api/course", CourseRoutes);

app.use("/api/admin", AdminauthRoutes);

export default app;
