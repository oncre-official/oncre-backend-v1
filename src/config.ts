import * as dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.ENV === 'production';

const slackWebhook = isProd ? process.env.PROD_SLACK_API_HOOK_URL : process.env.DEV_SLACK_API_HOOK_URL;

export const config = {
  port: process.env.PORT || 3001,
  app: {
    baseUrl: process.env.BASE_URL,
    env: process.env.ENV || 'development',
    isProd,
  },
  email: {
    defaultTo: process.env.EMAIL_DEFAULT_TO,
    defaultFrom: process.env.EMAIL_DEFAULT_FROM,
  },
  db: {
    url: process.env.MONGO_URL,
  },
  jwt: {
    secret: process.env.JWT_KEY,
    expiresIn: process.env.JWT_EXPIRY_DATE,
    saltOrRounds: Number(process.env.JWT_SALT),
  },
  redis: {
    host: 'localhost',
    port: 6379,
    url: 'redis://localhost:6379',
  },
  utilities: {},
  slack: {
    webhookUrl: slackWebhook,
    chatHookUrl: process.env.MSG_SLACK_API_HOOK_URL,
    requestHookUrl: process.env.TRADES_SLACK_API_HOOK_URL,
  },
};
