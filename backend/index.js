// server.js
import express from 'express';
import cookieParser from 'cookie-parser';


import { config } from './config/env-config.js';
import connectDB from './config/db.js';

import errorMiddleware from './middlewares/error.middleware.js';

import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';

const app = express();


connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);


app.use(errorMiddleware);


app.listen(config.port, () => {
  console.log(
    `Server running in ${config.nodeEnv} mode on port ${config.port}`
  );
});