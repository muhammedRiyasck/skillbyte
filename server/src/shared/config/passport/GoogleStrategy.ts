import { Request } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { IStudentRepository } from '../../../modules/student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../modules/instructor/domain/IRepositories/IInstructorRepository';
import { Student } from '../../../modules/student/domain/entities/Student';
import dotenv from 'dotenv';
import { HttpError } from '../../types/HttpError';
import { ERROR_MESSAGES } from '../../constants/messages';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';
import { UserRole } from '../../enums/UserRole';
import { UserAccountStatus } from '../../enums/UserAccountStatus';
dotenv.config();

export const configureGoogleStrategy = (
  studentRepo: IStudentRepository,
  instructorRepo: IInstructorRepository,
) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        passReqToCallback: true,
      },

      async (req: Request, accessToken, refreshToken, profile, done) => {
        try {
          const state = JSON.parse((req.query.state as string) || '{}');
          const role = state.role;

          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          if (!email)
            return done(
              new HttpError(
                'No email from Google',
                HttpStatusCode.UNAUTHORIZED,
              ),
              false,
            );

          if (role === UserRole.STUDENT) {
            let student = await studentRepo.findByEmail(email);
            if (!student) {
              student = new Student(
                name,
                email,
                profile.id,
                true, // isEmailVerified
                'google', // registeredVia
                profile.photos?.[0]?.value || null,
              );
              await studentRepo.save(student);
            } else if (
              student &&
              student.accountStatus !== UserAccountStatus.ACTIVE
            ) {
              return done(
                new HttpError(
                  ERROR_MESSAGES.ACCOUNT_BLOCKED,
                  HttpStatusCode.BAD_REQUEST,
                ),
                false,
              );
            }

            return done(null, { user: student, role: UserRole.STUDENT });
          } else if (role === UserRole.INSTRUCTOR) {
            const instructor = await instructorRepo.findByEmail(email);
            if (!instructor)
              return done(
                new HttpError(
                  'Instructor not found. You must register manually.',
                  HttpStatusCode.NOT_FOUND,
                ),
                false,
              );

            return done(null, { user: instructor, role: UserRole.INSTRUCTOR });
          } else {
            return done(
              new HttpError(
                'Unsupported role or invalid role selection.',
                HttpStatusCode.BAD_REQUEST,
              ),
              false,
            );
          }
        } catch (err) {
          done(err, false);
        }
      },
    ),
  );
};
