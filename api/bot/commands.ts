import {Telegraf} from "telegraf";
import controller from "./controller.js";

const bot = new Telegraf('');

bot.start(controller.start);
bot.command('ping', controller.ping);

bot.on('text', controller.saveAnswer);

export default bot;