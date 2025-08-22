import {createBrowserRouter} from 'react-router-dom';

import PublicLayout from '../../layouts/auth/PublicLayout.tsx';
import SignIn from '../../features/auth/pages/SignIn.tsx';
import StudentSignup from '../../features/auth/pages/StudentSignUp.tsx';
import Otp from '../../features/auth/pages/Otp.tsx';
import ForgotPassword from '../../features/auth/pages/ForgotPassword.tsx';
import ResetPassword from '../../features/auth/pages/ResetPassword.tsx'

import InstructorSignup from '../../features/auth/pages/InstructorSignUp.tsx';

import NotFound from '../../shared/ui/NotFound.tsx';
import LandingPage from '../../features/home/pages/Landing.tsx';
import StudentLayout from '../../layouts/student/StudentLayout.tsx';
import OAuthSuccess from '../../features/auth/components/OAuthSuccess.tsx';

import PublicRoute from './PublicRoute.tsx';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <PublicLayout />,
    children: [
      { path: 'login', element:( 
        <PublicRoute>
         <SignIn /> 
         </PublicRoute>)},
      { path: 'learner-register', element:
         <PublicRoute>
          <StudentSignup />
         </PublicRoute>
         },

      {
        path:'instructor-register', element:
        <PublicRoute>
          <InstructorSignup/>
        </PublicRoute>
      },
      { path: 'oauth-success', element: 
        <PublicRoute>
        <OAuthSuccess />
        </PublicRoute>
       },
      { path: 'forgot-password', element:
        <PublicRoute>
        <ForgotPassword/>
        </PublicRoute>
      }

    ],
    errorElement: <NotFound />,
  },
  {
    path:'/auth/otp',
    element:
    <PublicRoute>
     <Otp />
     </PublicRoute>,
    errorElement: <NotFound />,
  },
  {
    path:'/auth/reset-password',
    element:
    <PublicRoute>
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
      // { path: 'profile', element: <Profile /> },
      // { path: 'chat', element: <Chat /> },
    ],
    errorElement: <NotFound />,
  },
  
  // {
  //   path: '/instructor',
  //   element: <StudentLayout />,
  //   // element: <InstructorLayout />,
  //   children: [
  //     // { path: 'dashboard', element: <InstructorDashboard /> },
  //     // { path: 'create-course', element: <CreateCourse /> },
  //   ],
  // },
  // {
  //   path: '/admin',
  //   element: <AdminLayout />,
  //   children: [
  //     { path: 'dashboard', element: <AdminDashboard /> },
  //   ],
  // },
  // {
  //   path: '*',
  //   element: <NotFound />,
  // },
]);

  
export default router;
