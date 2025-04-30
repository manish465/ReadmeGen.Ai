import { Request, Response } from 'express';
import { Octokit } from '@octokit/rest';
import { IOctokitGetRepoDataInput } from '../types/prompt';
import { ICreatePromptResponse, IFileContentList } from '../types/github';

const octokit: Octokit = new Octokit();

export const createRepoPrompt = async (req: Request, res: Response) => {
    const { repo, filePaths } = req.query;

    if (repo === undefined) {
        res.status(400).send({ error: 'messing repo data' });
    }

    const inputDataList: string[] = repo?.toLocaleString().split('/') || [];
    const inputData: IOctokitGetRepoDataInput = {
        owner: inputDataList[inputDataList.length - 2],
        repo: inputDataList[inputDataList.length - 1],
    };

    let repoData;
    let fileContentDataList: IFileContentList[] = [];

    if (filePaths) {
        const inputFilePathList: string[] = filePaths?.toLocaleString().split(',') || [];
        fileContentDataList = await fetchFilesContent(
            inputData.owner,
            inputData.repo,
            inputFilePathList
        );
    }

    try {
        repoData = await octokit.repos.get({ owner: inputData.owner, repo: inputData.repo });
    } catch (e) {
        console.log(e);
    }

    const response: ICreatePromptResponse = {
        name: repoData?.data?.name || '',
        description: repoData?.data?.description || '',
        isForked: repoData?.data?.fork || false,
        license: repoData?.data?.license?.name || '',
        topics: repoData?.data?.topics || [],
        languages: repoData?.data?.language || '',
        fileContentList: fileContentDataList,
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
): Promise<IFileContentList[]> => {
    const results = await Promise.all(
        filePaths.map(async (path) => {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
            });

            if ('content' in data && typeof data.content === 'string') {
                return { path, content: Buffer.from(data.content, 'base64').toString('utf-8') };
            } else {
                return { path, content: null };
            }
        })
    );
    return results;
};
