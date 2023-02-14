import {NextFunction, Request, Response} from "express";
import logger from "../config/logger.js";


class gptController {
    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {

        } catch (e) {
            logger.error(`sendMessage: ${e}`);
            res.status(500).json({error: true, message: e});
            next(e);
        }
    }
}

export default new gptController();