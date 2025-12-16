import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { StudentModel } from '../../../modules/student/infrastructure/models/StudentModel';
import { InstructorModel } from '../../../modules/instructor/infrastructure/models/InstructorModel';

import dotenv from 'dotenv';
dotenv.config();

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

        if (!email) return done(new Error('Email is required'), null);

        if (role === 'student') {
          let student = await StudentModel.findOne({ email });

          if (!student) {
            student = await StudentModel.create({
              name,
              email,
              isEmailVerified: true,
              passwordHash: null,
              profilePictureUrl: profile.photos?.[0]?.value ?? null,
              registeredVia: 'facebook',
            });
          }

          return done(null, { user: student, role });
        } else if (role === 'instructor') {
          const instructor = await InstructorModel.findOne({ email });
          if (!instructor)
            return done(
              new Error('Instructor not found. You must register manually.'),
              null,
            );

          return done(null, { user: instructor, role });
        } else {
          return done(
            new Error('Unsupported role or invalid role selection'),
            null,
          );
        }
      } catch (err) {
        done(err, null);
      }
    },
  ),
);
