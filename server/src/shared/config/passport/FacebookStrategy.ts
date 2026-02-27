import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { IStudentRepository } from '../../../modules/student/domain/IRepositories/IStudentRepository';
import { IInstructorRepository } from '../../../modules/instructor/domain/IRepositories/IInstructorRepository';
import { Student } from '../../../modules/student/domain/entities/Student';
import dotenv from 'dotenv';
import { HttpError } from '../../types/HttpError';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';
dotenv.config();

export const configureFacebookStrategy = (
  studentRepo: IStudentRepository,
  instructorRepo: IInstructorRepository,
) => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID!,
        clientSecret: process.env.FACEBOOK_APP_SECRET!,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
        profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const state = JSON.parse((req.query.state as string) || '{}');
          const role = state.role;

          const email = profile.emails?.[0]?.value;
          const name = `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`;

          if (!email)
            return done(
              new HttpError('Email is required', HttpStatusCode.BAD_REQUEST),
              null,
            );

          if (role === 'student') {
            let student = await studentRepo.findByEmail(email);

            if (!student) {
              student = new Student(
                name,
                email,
                '', // passwordHash
                true, // isEmailVerified
                'facebook', // registeredVia
                profile.photos?.[0]?.value ?? null,
              );
              await studentRepo.save(student);
            }

            return done(null, { user: student, role });
          } else if (role === 'instructor') {
            const instructor = await instructorRepo.findByEmail(email);
            if (!instructor)
              return done(
                new HttpError(
                  'Instructor not found. You must register manually.',
                  HttpStatusCode.NOT_FOUND,
                ),
                null,
              );

            return done(null, { user: instructor, role });
          } else {
            return done(
              new HttpError(
                'Unsupported role or invalid role selection',
                HttpStatusCode.BAD_REQUEST,
              ),
              null,
            );
          }
        } catch (err) {
          done(err, null);
        }
      },
    ),
  );
};
