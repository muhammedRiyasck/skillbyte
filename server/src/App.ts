import express from 'express';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { config } from 'dotenv';
config();

import errorHandler from './shared/middlewares/GlobalErrorMiddleware';

import rootRouter from './routes';

import './shared/config/passport/GoogleStrategy';
import './shared/config/passport/FacebookStrategy';
import { paymentController } from './modules/enrollment/entry-point/EnrollmentContiner';

const app = express();
app.set('trust proxy', 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret_change_in_prod',
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Webhook must be before express.json() to capture raw body
app.post(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    await paymentController.handleWebhook(req, res);
  },
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGIN!, // allowed origins
  methods: ['GET', 'get', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true, // allow cookies or authorization headers
};
app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/assets', express.static(path.join(__dirname, '../assets')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
});

app.use(limiter);

app.use('/api', rootRouter);

app.use(errorHandler);
export default app;
