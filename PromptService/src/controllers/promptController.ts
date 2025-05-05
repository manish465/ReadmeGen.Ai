import { Request, Response } from 'express';
import { createRepoPromptCompactService, createRepoPromptService } from '../service/promptService';

export const createRepoPrompt = async (req: Request, res: Response): Promise<any> => {
    const { repo, filePaths } = req.query;

    if (!repo) {
        return res.status(400).send({ error: 'Missing repo data' });
    }

    const [owner, repoName] = repo?.toString().split('/').slice(-2) || ['', ''];

    if (!owner || !repoName) {
        return res.status(400).send({ error: 'Invalid repo format' });
    }

    const inputFilePathList = typeof filePaths === 'string' ? filePaths.split(',') : [];

    let response;
    response = await createRepoPromptService(owner, repoName, inputFilePathList);

    if (typeof response === 'object' && 'status' in response && 'message' in response) {
        return res.status(Number(response.status)).send({
            error: response.message,
        });
    }

    return res.status(200).send({ data: response });
};

export const createRepoPromptCompact = async (req: Request, res: Response): Promise<any> => {
    const { repo, filePaths } = req.query;

    if (!repo) {
        return res.status(400).send({ error: 'Missing repo data' });
    }

    const [owner, repoName] = repo?.toString().split('/').slice(-2) || ['', ''];
    const inputFilePathList = typeof filePaths === 'string' ? filePaths.split(',') : [];

    if (!owner || !repoName) {
        return res.status(400).send({ error: 'Invalid repo format' });
    }

    const customCommands: string[] =
        typeof req.query.customCommands === 'string'
            ? req.query.customCommands.split(',')
            : ['Undefined'];

    let response;

    response = await createRepoPromptCompactService(
        owner,
        repoName,
        inputFilePathList,
        customCommands
    );

    if (typeof response === 'object' && 'status' in response && 'message' in response) {
        return res.status(Number(response.status)).send({
            error: response.message,
        });
    }

    return res.status(200).send({ data: response });
};

export const healthCheck = (req: Request, res: Response) => {
    res.status(200).send({ message: 'Prompt Service is working' });
};
