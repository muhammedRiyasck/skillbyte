import { COMMON_ERRORS } from './commonErrors';
import { AUTH_ERRORS } from './authErrors';
import { COURSE_ERRORS } from './courseErrors';

export const ERROR_MESSAGES = {
  ...COMMON_ERRORS,
  ...AUTH_ERRORS,
  ...COURSE_ERRORS,
} as const;
