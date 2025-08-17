import {createBrowserRouter} from 'react-router-dom';

import PublicLayout from '../../layouts/auth/PublicLayout.tsx';
import SignIn from '../../features/auth/pages/SignIn.tsx';
import Signup from '../../features/auth/pages/SignUp.tsx';
import Otp from '../../features/auth/pages/Otp.tsx';
import ForgotPassword from '../../features/auth/pages/ForgotPassword.tsx';
import ResetPassword from '../../features/auth/pages/ResetPassword.tsx'
import NotFound from '../../shared/ui/NotFound.tsx';
import LandingPage from '../../features/home/pages/Landing.tsx';
import StudentLayout from '../../layouts/student/StudentLayout.tsx';
import OAuthSuccess from '../../features/auth/components/OAuthSuccess.tsx';


const router = createBrowserRouter([
  {
    path: '/auth',
    element: <PublicLayout />,
    children: [
      { path: 'login', element: <SignIn /> },
      { path: 'register', element: <Signup /> },
      { path: 'oauth-success', element: <OAuthSuccess /> },
      { path: 'forgot-password', element: <ForgotPassword/>}

    ],
    errorElement: <NotFound />,
  },
  {
    path:'/auth/otp',
    element: <Otp />,
    errorElement: <NotFound />,
  },
  {
    path:'/auth/reset-password',
    element: <ResetPassword/>
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
  //   element: <InstructorLayout />,
  //   children: [
  //     { path: 'dashboard', element: <InstructorDashboard /> },
  //     { path: 'create-course', element: <CreateCourse /> },
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
