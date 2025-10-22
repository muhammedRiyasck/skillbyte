import {createBrowserRouter} from 'react-router-dom';
import { lazy } from 'react';
import Fallback from './Fallback';
import { ROUTES } from './paths';
import ErrorHandler from './ErrorHandler';
import ErrorPage from '@shared/ui/ErrorPage';

// Helper function to get relative path from full path
const getRelativePath = (fullPath: string, basePath: string) => {
  return fullPath.replace(`${basePath}/`, '');
};

import PublicLayout from '@layouts/auth/PublicLayout.tsx';
const SignIn = lazy(() => import('@features/auth/pages/SignIn.tsx'));
const StudentSignup = lazy(() => import('@features/auth/pages/StudentSignUp.tsx'));
const Otp = lazy(() => import('@features/auth/pages/Otp.tsx'));
const ForgotPassword = lazy(() => import('@features/auth/pages/ForgotPassword.tsx'));
const ResetPassword = lazy(() => import('@features/auth/pages/ResetPassword.tsx'));

const LandingPage = lazy(() => import('@features/home/pages/Landing.tsx'));
import StudentLayout from '@layouts/student/StudentLayout.tsx';
const OAuthSuccess = lazy(() => import('@features/auth/components/OAuthSuccess.tsx'));

const InstructorSignup = lazy(() => import('@features/auth/pages/InstructorSignUp.tsx'));

import AdminLayout from '@layouts/admin/AdminLayout.tsx'                
const AdminSignIn = lazy(() => import('@features/admin/pages/SignIn.tsx'))


import PublicRoute from './PublicRoute.tsx';
import ProtectedRoute from './RoleBaseRoute.tsx';

import InstructorLayout from '@layouts/instructor/InstructorLayout.tsx';
const InstructorManagement = lazy(() => import('@features/admin/pages/InstructorManagement.tsx'));
const InstructorDashboard = lazy(() => import('@features/instructor/pages/Dashboard.tsx'));
const InstructorProfile = lazy(() => import('@features/instructor/pages/Profile.tsx'));
const ContentUploadPage = lazy(() => import('@features/course/pages/contentUpload/ContentUploadPage.tsx'));
const StudentManagement = lazy(() => import('@features/admin/pages/StudentManagement.tsx'));

const CreateCourse = lazy(() => import('@features/course/pages/CreateCourse.tsx'));
const InstructorCourses = lazy(() => import('@features/course/pages/InstructorCourses.tsx'));
const StudentCourses = lazy(() => import('@features/course/pages/StudentCourses.tsx'));

const router = createBrowserRouter([
  {
    path: ROUTES.auth.base,
    element: <PublicLayout />,
    children: [
      {  index: true, element:(
        <PublicRoute endPoint={ROUTES.root}>
         <Fallback><SignIn /></Fallback>
        </PublicRoute>)},
      { path: getRelativePath(ROUTES.auth.learnerRegister, ROUTES.auth.base), element:
         <PublicRoute endPoint={ROUTES.root}>
          <Fallback><StudentSignup /></Fallback>
         </PublicRoute>
         },

      {
        path: getRelativePath(ROUTES.auth.instructorRegister, ROUTES.auth.base), element:
        <PublicRoute endPoint={ROUTES.root}>
          <Fallback><InstructorSignup/></Fallback>
        </PublicRoute>
      },
      { path: getRelativePath(ROUTES.auth.oauthSuccess, ROUTES.auth.base), element:
        <PublicRoute endPoint={ROUTES.root}>
        <Fallback><OAuthSuccess /></Fallback>
        </PublicRoute>
       },
      { path: getRelativePath(ROUTES.auth.forgotPassword, ROUTES.auth.base), element:
        <PublicRoute endPoint={ROUTES.root}>
        <Fallback><ForgotPassword/></Fallback>
        </PublicRoute>
      }

    ],
    errorElement: <ErrorHandler />,
  },
  //layout is different for otp and reset password
  {
    path: ROUTES.auth.otp,
    element:
    <PublicRoute endPoint={ROUTES.root}>
     <Fallback><Otp /></Fallback>
     </PublicRoute>,
    errorElement: <ErrorHandler />,
  },
  {
    path: ROUTES.auth.resetPassword,
    element:
    <PublicRoute endPoint={ROUTES.root}>
    <Fallback><ResetPassword/></Fallback>
    </PublicRoute>,
    errorElement: <ErrorHandler />,
  },
  {
    path: ROUTES.root,
    element: <StudentLayout />,
    children: [

      { index: true, element:
        <PublicRoute endPoint=''>
         <Fallback><LandingPage /></Fallback>
         </PublicRoute>
      },
      { path: getRelativePath(ROUTES.student.courses, ROUTES.root), element:
      <ProtectedRoute roles={['student']}>
        <Fallback><StudentCourses /></Fallback>
      </ProtectedRoute>
      },
    ],
    errorElement: <ErrorHandler />,
  },

  {
    path: ROUTES.instructor.base,
    element: <InstructorLayout />,
    children: [
      { index:true, element:
        <ProtectedRoute roles={['instructor']}>
        <Fallback><InstructorDashboard /></Fallback>
        </ProtectedRoute>
       },
      { path: getRelativePath(ROUTES.instructor.profile, ROUTES.instructor.base), element:
        <ProtectedRoute roles={['instructor']}>
        <Fallback><InstructorProfile /></Fallback>
        </ProtectedRoute>
       },
      { path: getRelativePath(ROUTES.instructor.createCourseBase, ROUTES.instructor.base), element:
      <ProtectedRoute roles={['instructor']}>
        <Fallback><CreateCourse /></Fallback>
      </ProtectedRoute>
      },
      { path: getRelativePath(ROUTES.instructor.uploadCourseContent, ROUTES.instructor.base), element:
      <ProtectedRoute roles={['instructor']}>
        <Fallback><ContentUploadPage /></Fallback>
      </ProtectedRoute>
      },
      { path: getRelativePath(ROUTES.instructor.myCourses, ROUTES.instructor.base), element:
      <ProtectedRoute roles={['instructor']}>
        <Fallback><InstructorCourses /></Fallback>
      </ProtectedRoute>
      },
    ],
    errorElement: <ErrorHandler />,
  },
  {
    path: "*",
    element: <ErrorPage message="Page Not Found" statusCode={404} />,
  },
  {
    path: ROUTES.admin.base,
    element: <AdminLayout />,
    children: [
      { index: true, element:
         <PublicRoute endPoint={ROUTES.admin.studentManagement}>
         <Fallback><AdminSignIn /></Fallback>
        </PublicRoute>
        },
      { path: getRelativePath(ROUTES.admin.instructorManagement, ROUTES.admin.base), element:
      <ProtectedRoute roles={['admin']}>
      <Fallback><InstructorManagement /></Fallback>
      </ProtectedRoute>
      },
      { path: getRelativePath(ROUTES.admin.studentManagement, ROUTES.admin.base), element:
      <ProtectedRoute roles={['admin']}>
      <Fallback><StudentManagement /></Fallback>
      </ProtectedRoute>
      }
    ],
    errorElement: <ErrorHandler />,
  },

]);

  
export default router;
