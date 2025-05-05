import { Request, Response } from 'express';
import { createRepoPromptService, createRepoPromptCompactService } from '../service/promptService';

const extractRepoInfo = (repo?: string): [string, string] | null => {
    if (!repo) return null;
    const parts = repo.toString().split('/');
    if (parts.length < 2) return null;
    return parts.slice(-2) as [string, string];
};

export const createRepoPrompt = async (req: Request, res: Response): Promise<any> => {
    try {
        const { repo, inputFilePathList } = req.body;
        const repoInfo = extractRepoInfo(repo);

        if (!repoInfo) {
            return res.status(400).send({ error: 'Invalid or missing repo format' });
        }

        const [owner, repoName] = repoInfo;
        const response = await createRepoPromptService(owner, repoName, inputFilePathList);

        if (
            response &&
            typeof response === 'object' &&
            'status' in response &&
            'message' in response
        ) {
            return res.status(Number(response.status)).send({ error: response.message });
        }

        return res.status(200).send({ data: response });
    } catch (error) {
        return res.status(500).send({ error: 'Internal server error' });
    }
};

export const createRepoPromptCompact = async (req: Request, res: Response): Promise<any> => {
    try {
        const { repo, inputFilePathList, customCommands } = req.body;
        const repoInfo = extractRepoInfo(repo);

        if (!repoInfo) {
            return res.status(400).send({ error: 'Invalid or missing repo format' });
        }

        const [owner, repoName] = repoInfo;
        const response = await createRepoPromptCompactService(
            owner,
            repoName,
            inputFilePathList,
            customCommands
        );

        if (
            response &&
            typeof response === 'object' &&
            'status' in response &&
            'message' in response
        ) {
            return res.status(Number(response.status)).send({ error: response.message });
        }

        return res.status(200).send({ data: response });
    } catch (error) {
        return res.status(500).send({ error: 'Internal server error' });
    }
};

export const healthCheck = (_req: Request, res: Response): any => {
    return res.status(200).send({ message: 'Prompt Service is working' });
};
