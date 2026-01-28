export const AUTH_PATHS = [
  '/auth/login',
  '/admin/login',
  '/auth/register',
  '/student/register',
  '/instructor/register',
  '/auth/verify-otp',
  '/auth/refresh-token',
] as const;

/**
 * Checks if a given URL belongs to an authentication-related path.
 * These paths usually return 401 for "invalid credentials" rather than "token expired".
 */
export const isAuthPath = (url: string): boolean => {
  return AUTH_PATHS.some((path) => url.includes(path));
};
