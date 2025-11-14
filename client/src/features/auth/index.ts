export { default as SignIn } from './pages/SignIn';
export { default as StudentSignUp } from './pages/StudentSignUp';
export { default as InstructorSignUp } from './pages/InstructorSignUp';
export { default as Otp } from './pages/Otp';
export { default as ResetPassword } from './pages/ResetPassword';
export { default as ForgotPassword } from './pages/ForgotPassword';

export { default as ShowPassword } from './components/ShowPassword';
export { default as OAuthSuccess } from './hooks/UseOAuthSuccess';

export * from './services/AuthService';

export * from './types/Auth';
export * from './types/User';
export { setUser } from './AuthSlice';
