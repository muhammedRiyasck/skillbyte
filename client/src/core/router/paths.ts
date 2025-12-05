// Centralized route constants and helpers

export const ROUTES = {
  root: '/',
  notFound: '/404',

  auth: {
    base: '/auth',
    signIn: '/auth',
    learnerRegister: '/auth/learner-register',
    instructorRegister: '/auth/instructor-register',
    otp: '/auth/otp',
    resetPassword: '/auth/reset-password',
    forgotPassword: '/auth/forgot-password',
    oauthSuccess: '/auth/oauth-success',
  },

  student: {
    base: '/',
    courses: '/courses',
    profile: '/profile',
  },

  course: {
    details: '/course/:courseId',
  },

  instructor: {
    base: '/instructor',
    dashboard: '/instructor',
    profile: '/instructor/myProfile',
    createCourseBase: '/instructor/create-courseBase',
    uploadCourseContent: '/instructor/upload-courseContent',
    myCourses: '/instructor/myCourses',
  },

  admin: {
    base: '/admin',
    signIn: '/admin',
    instructorManagement: '/admin/instructor-management',
    studentManagement: '/admin/student-management',
    courseManagement: '/admin/course-management',
  },
} as const;

export type RouteValue = typeof ROUTES;


