import {createBrowserRouter} from 'react-router-dom';

import PublicLayout from '../../layouts/auth/PublicLayout.tsx';
import SignIn from '../../features/auth/pages/SignIn.tsx';
import StudentSignup from '../../features/auth/pages/StudentSignUp.tsx';
import Otp from '../../features/auth/pages/Otp.tsx';
import ForgotPassword from '../../features/auth/pages/ForgotPassword.tsx';
import ResetPassword from '../../features/auth/pages/ResetPassword.tsx'

import NotFound from '../../shared/ui/NotFound.tsx';
import LandingPage from '../../features/home/pages/Landing.tsx';
import StudentLayout from '../../layouts/student/StudentLayout.tsx';
import OAuthSuccess from '../../features/auth/components/OAuthSuccess.tsx';

import InstructorSignup from '../../features/auth/pages/InstructorSignUp.tsx';

import AdminLayout from '../../layouts/admin/AdminLayout.tsx'                
import AdminSignIn from '../../features/admin/pages/SignIn.tsx'


import PublicRoute from './PublicRoute.tsx';
import ProtectedRoute from './RoleBaseRoute.tsx';

import InstructorRequests from '../../features/admin/pages/InstructorRequests.tsx';
import InstructorDashboard from '../../features/instructor/pages/Dashboard.tsx';
import CreateCourse from '../../features/instructor/pages/CreateCourse.tsx';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <PublicLayout />,
    children: [
      {  index: true, element:( 
        <PublicRoute endPoint='/'>
         <SignIn /> 
         </PublicRoute>)},
      { path: 'learner-register', element:
         <PublicRoute endPoint='/'>
          <StudentSignup />
         </PublicRoute>
         },

      {
        path:'instructor-register', element:
        <PublicRoute endPoint='/'>
          <InstructorSignup/>
        </PublicRoute>
      },
      { path: 'oauth-success', element: 
        <PublicRoute endPoint='/'>
        <OAuthSuccess />
        </PublicRoute>
       },
      { path: 'forgot-password', element:
        <PublicRoute endPoint='/'>
        <ForgotPassword/>
        </PublicRoute>
      }

    ],
    errorElement: <NotFound />,
  },
  {
    path:'/auth/otp',
    element:
    <PublicRoute endPoint='/'>
     <Otp />
     </PublicRoute>,
    errorElement: <NotFound />,
  },
  {
    path:'/auth/reset-password',
    element:
    <PublicRoute endPoint='/'>
    <ResetPassword/>
    </PublicRoute>
  },
  // {
  //   path:'/auth/forgot-password',
  //   element: <ForgotPassword/>
  // },
  {
    path: '/',
    element: <StudentLayout />,
    children: [
      
      { index: true, element: <LandingPage /> },
      // { path: 'courses', element: <Courses /> },
      // { path: 'courses', element: <Courses /> },
      // { path: 'profile', element: <Profile /> },
      // { path: 'chat', element: <Chat /> },
    ],
    errorElement: <NotFound />,
  },
  
  {
    path: '/instructor',
    element: <StudentLayout />,
    // element: <InstructorLayout />,
    children: [
      { path: 'dashboard', element: <InstructorDashboard /> },
      { path: 'create-course', element: <CreateCourse /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element:
         <PublicRoute endPoint='/admin/instructor-request'>
         <AdminSignIn />  
        </PublicRoute>},
      { path: 'instructor-request', element: 
      <ProtectedRoute roles={['admin']}>
      <InstructorRequests /> 
      </ProtectedRoute>
      }
      // { path: 'dashboard', element: <AdminDashboard /> },
    ],
  },
  // {
  //   path: '*',
  //   element: <NotFound />,
  // },
]);

  
export default router;
