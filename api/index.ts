import cors from "cors";
import cookieParser from "cookie-parser";
import {DB_URI, SERVER_PORT} from "./config/settings.js";
import logger from "./config/logger.js";
import express, {Application} from "express";
import {writeDateLogging, logging} from "./middlewares/loggingMiddleware.js";
import dataRoute from "./routes/dataRoute.js";
import gptRoute from "./routes/gptRoute.js";
import mongoose from "mongoose";
import {__initBot} from "./bot/bot.js";

__initBot();
const app: Application = express();

app.use(express.json());
app.use(cors({
    origin: '*'
}));
app.use(cookieParser());
app.use(writeDateLogging);
app.use("/uploads", express.static('uploads'));
app.use("/api/data", dataRoute);
app.use("/api/gpt", gptRoute);
app.use(function(req, res){
    res.json({});
});
app.use(logging);

app.listen(SERVER_PORT, async () => {
    logger.info(`Server Started on port ${SERVER_PORT}`);
    mongoose.connect(DB_URI, {}, function (err) {
        if (err) {
            logger.error(`MongoDB connection error: ${err}`);
        } else {
            logger.info(`Connected to MongoDB`);
        }
    });
});
