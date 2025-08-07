import {createBrowserRouter} from 'react-router-dom';

import PublicLayout from '../layout/Auth/PublicLayout.tsx';
import SignIn from '../../pages/auth/SignIn.tsx';
import Signup from '../../pages/auth/SignUp.tsx';
import LandingPage from '../../pages/home/Landing.tsx';
import StudentLayout from '../layout/Student/StudentLayout.tsx';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <PublicLayout />,
    children: [
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <Signup /> },
    ],
  },
  {
    path: '/',
    element: <StudentLayout />,
    children: [
      
      { index: true, element: <LandingPage /> },
      // { path: 'courses', element: <Courses /> },
      // { path: 'profile', element: <Profile /> },
      // { path: 'chat', element: <Chat /> },
    ],
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
]);

  
export default router;
