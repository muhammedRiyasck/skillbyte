import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import Fallback from "./Fallback";
import { ROUTES } from "./paths";
import ErrorHandler from "./ErrorHandler";
import ErrorPage from "@shared/ui/ErrorPage";


import PublicLayout from "@layouts/auth/PublicLayout.tsx";
const Otp = lazy(() => import("@features/auth/pages/Otp.tsx"));
const ResetPassword = lazy(() => import("@features/auth/pages/ResetPassword.tsx"));
const OAuthSuccess = lazy(() => import("@/features/auth/hooks/UseOAuthSuccess.tsx"));
const ForgotPassword = lazy(() => import("@features/auth/pages/ForgotPassword.tsx"));

import PublicRoute from "./PublicRoute.tsx";
import ProtectedRoute from "./RoleBaseRoute.tsx";

import AdminLayout from "@layouts/admin/AdminLayout.tsx";
const AdminSignIn = lazy(() => import("@features/admin/pages/SignIn.tsx"));
const AdminCourses = lazy(() => import("@features/course/pages/AdminCourses.tsx"));
const InstructorManagement = lazy(() => import("@features/admin/pages/InstructorManagement.tsx"));
const StudentManagement = lazy(() => import("@features/admin/pages/StudentManagement.tsx"));

import InstructorLayout from "@layouts/instructor/InstructorLayout.tsx";
const InstructorSignup = lazy(() => import("@features/auth/pages/InstructorSignUp.tsx"));
const InstructorEnrollments = lazy(() => import("@/features/instructor/pages/Enrollments.tsx"));
const EarningsHistory = lazy(() => import("@/features/instructor/pages/EarningsHistory.tsx"));
const InstructorProfile = lazy(() => import("@features/instructor/pages/Profile.tsx"));
const CreateCourse = lazy(() => import("@features/course/pages/CreateCourse.tsx"));
const ContentUploadPage = lazy(() => import("@features/course/pages/contentUpload/ContentUploadPage.tsx"));
const InstructorCourses = lazy(() => import("@features/course/pages/InstructorCourses.tsx"));


import StudentLayout from "@layouts/student/StudentLayout.tsx";
const SignIn = lazy(() => import("@features/auth/pages/SignIn.tsx"));
const StudentSignup = lazy(() => import("@features/auth/pages/StudentSignUp.tsx"));
const LandingPage = lazy(() => import("@features/home/pages/Landing.tsx"));
const StudentCourses = lazy(() => import("@features/course/pages/StudentCourses.tsx"));
const CourseDetails = lazy(() => import("@features/course/pages/CourseDetails.tsx"));
const CheckoutPage = lazy(() => import("@features/enrollment").then(module => ({ default: module.CheckoutPage })));
const SuccessPage = lazy(() => import("@features/enrollment").then(module => ({ default: module.SuccessPage })));
const PurchaseHistory = lazy(() => import("@features/student/pages/PurchaseHistory.tsx"));

const router = createBrowserRouter([
  {
    path: ROUTES.auth.signIn,
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute endPoint={ROUTES.root}>
            <Fallback>
              <SignIn />
            </Fallback>
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.auth.learnerRegister,
        element: (
          <PublicRoute endPoint={ROUTES.root}>
            <Fallback>
              <StudentSignup />
            </Fallback>
          </PublicRoute>
        ),
      },

      {
        path: ROUTES.auth.instructorRegister,
        element: (
          <PublicRoute endPoint={ROUTES.root}>
            <Fallback>
              <InstructorSignup />
            </Fallback>
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.auth.oauthSuccess,
        element: (
          <PublicRoute endPoint={ROUTES.root}>
            <Fallback>
              <OAuthSuccess />
            </Fallback>
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.auth.forgotPassword,
        element: (
          <PublicRoute endPoint={ROUTES.root}>
            <Fallback>
              <ForgotPassword />
            </Fallback>
          </PublicRoute>
        ),
      },
       {
        path: ROUTES.auth.reapply, 
        element: (
          <PublicRoute endPoint={ROUTES.root}>
            <Fallback>
              <InstructorSignup />
            </Fallback>
         </PublicRoute>
        ),
      }
    ],
    errorElement: <ErrorHandler />,
  },
  //layout is different for otp and reset password
  {
    path: ROUTES.auth.otp,
    element: (
      <PublicRoute endPoint={ROUTES.root}>
        <Fallback>
          <Otp />
        </Fallback>
      </PublicRoute>
    ),
    errorElement: <ErrorHandler />,
  },
  {
    path: ROUTES.auth.resetPassword,
    element: (
      <PublicRoute endPoint={ROUTES.root}>
        <Fallback>
          <ResetPassword />
        </Fallback>
      </PublicRoute>
    ),
    errorElement: <ErrorHandler />,
  },
  {
    path: ROUTES.root,
    element: <StudentLayout />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute endPoint="">
            <Fallback>
              <LandingPage />
            </Fallback>
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.student.courses,
        element: (
          <ProtectedRoute roles={["student"]}>
            <Fallback>
              <StudentCourses />
            </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.student.checkout,
        element: (
          <ProtectedRoute roles={["student"]}>
             <Fallback>
               <CheckoutPage />
             </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: "enrollment/success",
        element: (
          <ProtectedRoute roles={["student"]}>
             <Fallback>
               <SuccessPage />
             </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.student.purchases,
        element: (
          <ProtectedRoute roles={["student"]}>
            <Fallback>
              <PurchaseHistory />
            </Fallback>
          </ProtectedRoute>
        ),
      },
    ],
  },
   {
    path: ROUTES.course.details,
    element: (
      <ProtectedRoute roles={["student", "admin"]}>
        <Fallback>
          <CourseDetails />
        </Fallback>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.instructor.dashboard,
    element: <InstructorLayout />,
    children: [
      {
        path: ROUTES.instructor.dashboard  ,
        element: (
          <ProtectedRoute roles={["instructor"]}>
            <Fallback>
              <InstructorEnrollments />
            </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.instructor.profile, 
        element: (
          <ProtectedRoute roles={["instructor"]}>
            <Fallback>
              <InstructorProfile />
            </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.instructor.createCourseBase, 
        element: (
          <ProtectedRoute roles={["instructor"]}>
            <Fallback>
              <CreateCourse />
            </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.instructor.uploadCourseContent, 
        element: (
          <ProtectedRoute roles={["instructor"]}>
            <Fallback>
              <ContentUploadPage />
            </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.instructor.myCourses, 
        element: (
          <ProtectedRoute roles={["instructor"]}>
            <Fallback>
              <InstructorCourses />
            </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.instructor.earnings,
        element: (
          <ProtectedRoute roles={["instructor"]}>
            <Fallback>
              <EarningsHistory />
            </Fallback>
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <ErrorHandler />,
  },
  {
    path: "*",
    element: <ErrorPage message="Page Not Found" statusCode={404} />,
  },
  {
    path: ROUTES.admin.signIn,
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute endPoint={ROUTES.admin.courseManagement}>
            <Fallback>
              <AdminSignIn />
            </Fallback>
          </PublicRoute>
        ),
      },
      {
        path: ROUTES.admin.instructorManagement, 
        element: (
          <ProtectedRoute roles={["admin"]}>
            <Fallback>
              <InstructorManagement />
            </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.admin.studentManagement, 
        element: (
          <ProtectedRoute roles={["admin"]}>
            <Fallback>
              <StudentManagement />
            </Fallback>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.admin.courseManagement, 
        element: (
          <ProtectedRoute roles={["admin"]}>
            <Fallback>
              <AdminCourses />
            </Fallback>
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <ErrorHandler />,
  },
]);

export default router;
