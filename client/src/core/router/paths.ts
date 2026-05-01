// Centralized route constants

export const ROUTES = {
  root: '/',
  notFound: '/404',
  notifications: '/notifications',
  chat: '/chat',
  videoCall: '/video-call/:roomId',

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
    checkout: '/checkout/:id',
    paymentSuccess: '/enrollment/success',
    purchases: '/purchases',
    enrolledCourses: '/my-courses',
    mentorship: {
      browse: '/mentorship/browse',
      bookings: '/mentorship/bookings',
    },
  },

  course: {
    details: '/course/:id',
  },

  instructor: {
    dashboard: '/instructor',
    profile: '/instructor/myProfile',
    createCourseBase: '/instructor/create-courseBase',
    uploadCourseContent: '/instructor/upload-courseContent',
    myCourses: '/instructor/myCourses',
    earnings: '/instructor/earnings',
    enrollments: '/instructor/enrollments',
    mentorship: {
      slots: '/instructor/mentorship/slots',
      bookings: '/instructor/mentorship/bookings'
    },
    reviews: '/instructor/reviews',
  },

  admin: {
    signIn: '/admin',
    dashboard: '/admin/dashboard',
    instructorManagement: '/admin/instructor-management',
    studentManagement: '/admin/student-management',
    courseManagement: '/admin/course-management',
    withdrawalManagement: '/admin/withdrawals',
    reportedContent: '/admin/reports',
    reviewManagement: '/admin/reviews',
  },
} as const;

export type RouteValue = typeof ROUTES;


