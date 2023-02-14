import {Context} from "telegraf";
import {Message} from "telegraf/typings/core/types/typegram";
import logger from "../config/logger.js";
import Page from "../models/Quiz.js";

class Controller {
    async start(ctx: Context) {
        try {
            return ctx.reply('Hello');
        } catch (e) {
            logger.error(`[BOT] start: ${e}`);
        }
    }

    async ping(ctx: Context) {
        try {
            return ctx.reply('pong');
        } catch (e) {
            logger.error(`[BOT] ping: ${e}`);
        }
    }

    async saveAnswer(ctx: Context) {
        try {
            if ((ctx.message as Message.TextMessage).reply_to_message) {
                const message = (ctx.message as Message.TextMessage).reply_to_message;
                const answer = (ctx.message as Message.TextMessage).text;
                const doc = message as Message.DocumentMessage
                if (doc.document) {
                    const page = await Page.findOneAndUpdate({unique_id: doc.document.file_unique_id}, {
                        $push: {
                            answers: {
                                username: ctx.from?.username || ctx.from?.first_name,
                                answer: answer
                            }
                        }
                    });

                    if (page) {
                        return ctx.reply('Ответ был отправлен 🔥', {reply_to_message_id: ctx.message?.message_id});
                    } else {
                        return ctx.reply('Что-то пошло не так 😔\nВозможно документ не сохранен в бд',
                            {reply_to_message_id: ctx.message?.message_id});
                    }
                }
            }
        } catch (e) {
            logger.error(`[BOT] saveAnswer: ${e}`);
        }
    }
}

export default new Controller();