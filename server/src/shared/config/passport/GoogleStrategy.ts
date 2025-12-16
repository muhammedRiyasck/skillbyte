import { Request } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import { StudentModel } from "../../../modules/student/infrastructure/models/StudentModel";

import { StudentRepository } from '../../../modules/student/infrastructure/repositories/StudentRepository';
const StudentModel = new StudentRepository();

import { Student } from '../../../modules/student/domain/entities/Student';
import { InstructorModel } from '../../../modules/instructor/infrastructure/models/InstructorModel';
import dotenv from 'dotenv';
import { HttpError } from '../../types/HttpError';
import { ERROR_MESSAGES } from '../../constants/messages';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';
dotenv.config();

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
        if (!email) return done(new Error('No email from Google'), false);

        if (role === 'student') {
          let student = await StudentModel.findByEmail(email);
          if (!student) {
            student = new Student(
              name,
              email,
              profile.id,
              true, // isEmailVerified
              'google', // registeredVia
              profile.photos?.[0]?.value || null,
            );
            await StudentModel.save(student);
          } else if (student && student.accountStatus !== 'active') {
            return done(
              new HttpError(
                ERROR_MESSAGES.ACCOUNT_BLOCKED,
                HttpStatusCode.BAD_REQUEST,
              ),
              false,
            );
          }

          return done(null, { user: student, role: 'student' });
        } else if (role === 'instructor') {
          // Just allow login for existing instructor
          const instructor = await InstructorModel.findOne({ email });
          if (!instructor)
            return done(
              new Error('Instructor not found. You must register manually.'),
              false,
            );

          return done(null, { user: instructor, role: 'instructor' });
        } else {
          return done(
            new Error('Unsupported role or invalid role selection.'),
            false,
          );
        }
      } catch (err) {
        done(err, false);
      }
    },
  ),
);
