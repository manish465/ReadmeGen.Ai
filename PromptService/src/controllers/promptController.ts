import { Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { IContentError, IOctokitGetRepoDataInput } from '../types/prompt';
import { ICreatePromptResponse, IFileContentList } from '../types/github';

const octokit: Octokit = new Octokit();

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
    const inputData: IOctokitGetRepoDataInput = {
        owner: owner,
        repoName: repoName,
    };

    let repoData;
    let fileContentDataList: IFileContentList[] | IContentError[] = [];

    if (inputFilePathList.length > 0) {
        fileContentDataList = await fetchFilesContent(
            inputData.owner,
            inputData.repoName,
            inputFilePathList
        );

        if (fileContentDataList.some((item) => 'errorMessage' in item && item.errorMessage)) {
            res.status(400).send({
                error: 'Error fetching file content',
            });
            return;
        }
    }

    try {
        repoData = await octokit.repos.get({ owner: inputData.owner, repo: inputData.repoName });
    } catch (e: any) {
        res.status(e?.error?.status || 400).send({
            error: e?.error?.response?.data?.message || 'Somthing went wrong',
        });
    }

    const response: ICreatePromptResponse = {
        name: repoData?.data?.name || '',
        description: repoData?.data?.description || '',
        isForked: repoData?.data?.fork || false,
        license: repoData?.data?.license?.name || '',
        topics: repoData?.data?.topics || [],
        languages: repoData?.data?.language || '',
        fileContentList: fileContentDataList.filter(
            (item): item is IFileContentList => 'content' in item && item.content !== null
        ),
    };

    res.status(200).send({ data: response });
};

export const healthCheck = (req: Request, res: Response) => {
    res.status(200).send({ message: 'Prompt Service is working' });
};

export const fetchFilesContent = async (
    owner: string,
    repo: string,
    filePaths: string[]
): Promise<IFileContentList[] | IContentError[]> => {
    const results: IFileContentList[] | IContentError[] = [];

    for (const path of filePaths) {
        try {
            const { data } = await octokit.rest.repos.getContent({ owner, repo, path });

            if ('content' in data && typeof data.content === 'string') {
                results.push({
                    path,
                    content: Buffer.from(data.content, 'base64').toString('utf-8'),
                    status: null,
                    errorMessage: null,
                });
            } else {
                results.push({ path, content: null, status: null, errorMessage: null });
            }
        } catch (error: any) {
            results.push({
                path,
                content: null,
                status: error?.status,
                errorMessage: error?.response?.data?.message || 'Failed to fetch content',
            });
        }
    }

    return results;
};
