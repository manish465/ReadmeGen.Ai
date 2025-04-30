import express, { Router } from "express";
import { createRepoPrompt, healthCheck } from "../controllers/promptController";

const router: Router = express.Router();

router.post("/ingest", createRepoPrompt);
router.get("/health-check", healthCheck);

export default router;