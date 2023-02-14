import {Telegraf} from "telegraf";
import {BOT} from "../config/settings.js";
import commands from "./commands.js";
import menu from "./menu.js";
import logger from "../config/logger.js";

export const bot = new Telegraf(BOT.token);
export const __initBot = () => {};

bot.use(commands);

bot.telegram.setMyCommands(menu).then(() => {
    logger.info(`[BOT] commands set`);
});

bot.launch().then(() => {
    logger.info(`[BOT] started`);
});