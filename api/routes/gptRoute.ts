import {Router} from "express";
import gptController from "../controllers/gptController.js";


const router: Router = Router();

router.post("/sendMessage", gptController.sendMessage);

export default router;