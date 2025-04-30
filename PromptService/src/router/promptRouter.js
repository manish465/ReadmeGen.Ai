import { Router } from "express";
import { prompt, healthCheck } from "../service/promptService";

const router = Router();

router.post("/", prompt);
router.post("/health-check", healthCheck);
