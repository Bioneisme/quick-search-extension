import multer from "multer";
import fs from "fs";
import moment from "moment";

const storagePDF = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./uploads/pdf/`);
    },
    filename(req, file, cb) {
        if (fs.existsSync(`./uploads/pdf/${file.originalname}`)) {
            cb(new Error('file_already_exists'), file.originalname);
        }
        cb(null, file.originalname);
    }
});

const storageHTML = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `./uploads/html/`);
    },
    filename(req, file, cb) {
        const date = moment().format('DD-HH.mm.ss');
        if (fs.existsSync(`./uploads/html/${date}-${file.originalname}`)) {
            cb(new Error('file_already_exists'), `${date}-${file.originalname}`);
        }
        cb(null, `${date}-${file.originalname}`);
    }
});

export const uploadPDF = multer({
    storage: storagePDF,
    fileFilter(req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
            cb(null, false)
            return cb(new Error('file_not_pdf'));
        } else {
            cb(null, true);
        }
    }
});

export const uploadHTML = multer({
    storage: storageHTML
});