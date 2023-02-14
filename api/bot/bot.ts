import {Telegraf} from "telegraf";
import {BOT} from "../config/settings.js";
import commands from "./commands.js";
import menu from "./menu.js";

export const bot = new Telegraf(BOT.token);

bot.use(commands);

bot.telegram.setMyCommands(menu);