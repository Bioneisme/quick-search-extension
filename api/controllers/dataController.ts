import {NextFunction, Request, Response} from "express";
import pdf from "pdf-parse";
import fs from "fs";
import logger from "../config/logger.js";
import {fromPath} from "pdf2pic";
import FileModel from "../models/File.js";
import axios from "axios";
import {BOT} from "../config/settings.js";
import FormData from "form-data";
import {promisify} from "util";
import moment from "moment";
import Quiz from "../models/Quiz.js";

const unlinkAsync = promisify(fs.unlink);

const storeOptions = (file: string) => {
    return {
        density: 100,
        saveFilename: file,
        savePath: "./uploads/img",
        format: "png",
        width: 500,
        height: 500,
        quality: 100,
    }
};

async function parsePDF(dataBuffer: Buffer) {
    const res = await pdf(dataBuffer, {pagerender: render_page});
    return res.text.split('%END-PAGE%');
}

function render_page(pageData: any) {
    let render_options = {
        normalizeWhitespace: false,
        disableCombineTextItems: false
    }

    return pageData.getTextContent(render_options)
        .then(function (textContent: { items: any; }) {
            let lastY, text = '';
            for (let item of textContent.items) {
                if (lastY == item.transform[5] || !lastY) {
                    text += item.str;
                } else {
                    text += ' ' + item.str;
                }
                lastY = item.transform[5];
            }
            return text + '%END-PAGE%';
        });
}

class DataController {
    async getFiles(req: Request, res: Response, next: NextFunction) {
        try {
            const files = await FileModel.find({}).select('filename pages');
            res.json({files});
            return next();
        } catch (e) {
            logger.error(`getFiles: ${e}`);
            res.status(500).json({error: true, message: e});
            next(e);
        }
    }

    async pdfToText(req: Request, res: Response, next: NextFunction) {
        try {
            const filePath = req.file?.path;
            if (!filePath) {
                res.status(500).json({error: true, message: 'file_not_uploaded'});
                return next();
            }

            const dataBuffer = fs.readFileSync(filePath);
            const result = await parsePDF(dataBuffer);
            const filename = req.file?.filename.split('.pdf')[0] || 'undefined';
            const created = await FileModel.updateOne(
                {filename},
                {filename, pages: result.length - 1, text: result},
                {upsert: true}
            );
            if (created) {
                res.json({file: filename, pages: result.length - 1, result});
            } else {
                res.status(500).json({error: true, message: 'file_not_saved'});
            }
            return next();
        } catch (e) {
            logger.error(`pdfToText: ${e}`);
            res.status(500).json({error: true, message: e});
            next(e);
        }
    }

    async findImgByText(req: Request, res: Response, next: NextFunction) {
        try {
            const {text, file} = req.body;
            if (!text || !file) {
                res.status(400).json({error: true, message: 'missing_params'});
                return next();
            }
            const findText = await FileModel.findOne({filename: file});
            if (!findText) {
                res.status(404).json({error: true, message: 'not_found'});
                return next();
            }
            const index = findText.text.findIndex((item: string) => item.includes(text));

            if (index === -1) {
                res.status(404).json({error: true, message: 'not_found'});
                return next();
            }

            const imgPath = `./uploads/img/${file}.${index + 1}.png`;
            if (fs.existsSync(imgPath)) {
                res.send(`${file}.${index + 1}.png`);
                return next();
            }

            const storeAsImage = fromPath(`./uploads/pdf/${file}.pdf`, storeOptions(file));
            return storeAsImage(index + 1).then(() => {
                res.send(`${file}.${index + 1}.png`);
                return next();
            }).catch(e => {
                res.status(500).send({message: e});
                return next(e);
            });
        } catch (e) {
            logger.error(`findImgByText: ${e}`);
            res.status(500).json({error: true, message: e});
            next(e);
        }
    }

    async findImgByTextAll(req: Request, res: Response, next: NextFunction) {
        try {
            const {text} = req.body;
            if (!text) {
                res.status(400).json({error: true, message: 'missing_text'});
                return next();
            }

            const files = await FileModel.find().select('filename');
            for (const file of files) {
                const filename = file.filename;

                const findText = await FileModel.findOne({filename});
                if (!findText) {
                    res.status(404).json({error: true, message: 'not_found'});
                    return next();
                }
                const index = findText.text.findIndex((item: string) => item.includes(text));
                if (index === -1) {
                    continue;
                }

                const imgPath = `./uploads/img/${filename}.${index + 1}.png`;
                if (fs.existsSync(imgPath)) {
                    res.send(`${filename}.${index + 1}.png`);
                    return next();
                }
                const storeAsImage = fromPath(`./uploads/pdf/${filename}.pdf`, storeOptions(filename));
                return storeAsImage(index + 1).then(() => {
                    res.send(`${filename}.${index + 1}.png`);
                    return next();
                }).catch(e => {
                    res.status(500).json({error: true, message: e});
                    return next();
                });
            }

            res.status(404).json({error: true, message: 'not_found'});
            return next();
        } catch (e) {
            logger.error(`findImgByTextAll: ${e}`);
            res.status(500).json({error: true, message: e});
            next(e);
        }
    }

    async saveHTML(req: Request, res: Response, next: NextFunction) {
        try {
            const BOT_API = `https://api.telegram.org/bot${BOT.token}`;

            if (req.file) {
                const dataBuffer = fs.readFileSync(req.file.path);
                const formData = new FormData();
                formData.append('chat_id', BOT.channel_id);
                formData.append('document', dataBuffer, req.file.originalname);

                return axios.post(BOT_API + '/sendDocument', formData, {
                    headers: formData.getHeaders()
                }).then(async result => {
                    if (req.file) await unlinkAsync(req.file.path);
                    await Quiz.create({
                        filename: req.file?.originalname,
                        unique_id: result.data.result.document.file_unique_id,
                        date: moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                    res.json({status: 'ok'});
                    return next();
                }).catch(async e => {
                    if (req.file) await unlinkAsync(req.file.path).catch(e => logger.error(`unlinkAsync: ${e}`));
                    res.status(500).json({error: true, message: e});
                    return next(e);
                })
            }
        } catch (e) {
            logger.error(`saveHTML: ${e}`);
            res.status(500).json({error: true, message: e});
            next(e);
        }
    }

    async getQuizzes(req: Request, res: Response, next: NextFunction) {
        try {
            const quizzes = await Quiz.find();
            if (!quizzes) {
                res.status(404).json({error: true, message: 'not_found'});
                return next();
            }

            res.send(quizzes);
            return next();
        } catch (e) {
            logger.error(`getQuizzes: ${e}`);
            res.status(500).json({error: true, message: e});
            next(e);
        }
    }
}

export default new DataController();