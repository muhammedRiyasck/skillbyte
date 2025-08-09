import {createBrowserRouter} from 'react-router-dom';

import PublicLayout from '../../layouts/auth/PublicLayout.tsx';
import SignIn from '../../features/auth/pages/SignIn.tsx';
import Signup from '../../features/auth/pages/SignUp.tsx';
import LandingPage from '../../features/home/pages/Landing.tsx';
import StudentLayout from '../../layouts/student/StudentLayout.tsx';

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
