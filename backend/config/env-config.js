// config/index.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO,
  nodeEnv: process.env.NODE_ENV || 'development',

};