// Centralized route constants and helpers

export const ROUTES = {
  root: '/',
  notFound: '/404',
  notifications: '/notifications',

  auth: {
    signIn: '/auth',
    learnerRegister: '/auth/learner-register',
    instructorRegister: '/auth/instructor-register',
    otp: '/auth/otp',
    resetPassword: '/auth/reset-password',
    forgotPassword: '/auth/forgot-password',
    oauthSuccess: '/auth/oauth-success',
    reapply: '/auth/reapply',
  },

  student: {
    courses: '/courses',
    profile: '/profile',
    checkout: '/checkout/:courseId',
    paymentSuccess: '/enrollment/success',
    purchases: '/purchases',
    enrolledCourses: '/my-courses',
  },

  course: {
    details: '/course/:courseId',
  },

  instructor: {
    dashboard: '/instructor',
    profile: '/instructor/myProfile',
    createCourseBase: '/instructor/create-courseBase',
    uploadCourseContent: '/instructor/upload-courseContent',
    myCourses: '/instructor/myCourses',
    earnings: '/instructor/earnings',
  },

  admin: {
    signIn: '/admin',
    instructorManagement: '/admin/instructor-management',
    studentManagement: '/admin/student-management',
    courseManagement: '/admin/course-management',
  },
} as const;

export type RouteValue = typeof ROUTES;


