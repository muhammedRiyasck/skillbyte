import {createBrowserRouter} from 'react-router-dom';

import SignIn from '../../pages/auth/SignIn.tsx';
import Signup from '../../pages/auth/SignUp.tsx';
import PublicLayout from '../layout/Auth/PublicLayout.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      // { index: true, element: <Home /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <Signup /> },
    ],
  },
  // {
  //   path: '/user',
  //   element: <UserLayout />,
  //   children: [
  //     { path: 'courses', element: <Courses /> },
  //     { path: 'profile', element: <Profile /> },
  //     { path: 'chat', element: <Chat /> },
  //   ],
  // },
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
