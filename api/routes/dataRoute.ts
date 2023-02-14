import {Router} from "express";
import dataController from "../controllers/dataController.js";
import {uploadHTML, uploadPDF} from "../utils/multer.js";

const router: Router = Router();

router.post("/uploadPdf", uploadPDF.single('file'), dataController.pdfToText);
router.post("/findImgByText", dataController.findImgByText);
router.post("/findImgByTextAll", dataController.findImgByTextAll);

router.get("/getFiles", dataController.getFiles);
router.post("/saveHTML", uploadHTML.single('file'), dataController.saveHTML);
router.get("/getQuizzes", dataController.getQuizzes);

export default router;