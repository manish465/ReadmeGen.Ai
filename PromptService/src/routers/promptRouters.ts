import express, { Router } from 'express';
import {
    createRepoPrompt,
    createRepoPromptCompact,
    healthCheck,
} from '../controllers/promptController';

const router: Router = express.Router();

router.post('/ingest', createRepoPrompt);
router.post('/prompt', createRepoPromptCompact);
router.get('/health-check', healthCheck);

export default router;
