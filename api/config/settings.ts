import dotenv from "dotenv";
dotenv.config();

const DEFAULT_DB_URI: string = 'mongodb://localhost:27017/ext';
const DEFAULT_SERVER_PORT: number = 5000;
const DEFAULT_REDIS_HOST: string = 'redis';
const DEFAULT_REDIS_PORT: string = '6379'
const DEFAULT_REDIS_PASSWORD: string = '';

export const DB_URI: string = process.env.DB_URI || DEFAULT_DB_URI;
export const SERVER_PORT: number = +(process.env.SERVER_PORT || DEFAULT_SERVER_PORT);
const REDIS_HOST: string = process.env.REDIS_HOST || DEFAULT_REDIS_HOST;
const REDIS_PORT: string = process.env.REDIS_PORT || DEFAULT_REDIS_PORT;
const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || DEFAULT_REDIS_PASSWORD;
const BOT_TOKEN: string = process.env.BOT_TOKEN as string;
const CHANNEL_ID: string = process.env.CHANNEL_ID as string;

export const REDIS = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
}

export const BOT = {
    token: BOT_TOKEN,
    channel_id: CHANNEL_ID
}