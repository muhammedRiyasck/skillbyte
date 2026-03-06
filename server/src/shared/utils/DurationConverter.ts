import { ERROR_MESSAGES } from '../constants/messages';
import { HttpStatusCode } from '../enums/HttpStatusCodes';
import { HttpError } from '../types/HttpError';
import { CourseDuration } from '../enums/CourseDuration';

export default function DurationConverter(durationStr: string): Date {
  const durationINString = durationStr;
  let calculatedDate: Date;
  if (durationINString == CourseDuration.LIFETIME) {
    // find the current date and add 100 years to it
    calculatedDate = new Date(
      new Date().setFullYear(new Date().getFullYear() + 100),
    );
  } else if (durationINString === CourseDuration.ONE_YEAR) {
    calculatedDate = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1),
    );
  } else if (durationINString === CourseDuration.SIX_MONTHS) {
    calculatedDate = new Date(new Date().setMonth(new Date().getMonth() + 6));
  } else {
    throw new HttpError(
      ERROR_MESSAGES.DURATION_NOT_VALID,
      HttpStatusCode.BAD_REQUEST,
    );
  }
  return calculatedDate;
}
