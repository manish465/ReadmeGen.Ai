import { Octokit } from '@octokit/rest';
import { ICreatePromptResponse, IFileContentList } from '../types/github';
import { IErrorResonse } from '../types/prompt';

export const octokit: Octokit = new Octokit();

export const fetchFilesContent = async (
    owner: string,
    repo: string,
    filePaths: string[]
): Promise<IFileContentList[] | IErrorResonse> => {
    const results: IFileContentList[] = [];

    try {
        for (const path of filePaths) {
            const { data } = await octokit.rest.repos.getContent({ owner, repo, path });

            if ('content' in data && typeof data.content === 'string') {
                results.push({
                    path,
                    content: Buffer.from(data.content, 'base64').toString('utf-8'),
                });
            } else {
                results.push({ path, content: 'No data' });
            }
        }

        return results;
    } catch (error: any) {
        return {
            status: error?.error?.status || 400,
            message: error?.error?.response?.data?.message || 'Somthing went wrong',
        };
    }
};

export const createRepoPromptService = async (
    owner: string,
    repo: string,
    filePaths: string[]
): Promise<ICreatePromptResponse | IErrorResonse> => {
    const fileContentDataList: IFileContentList[] | IErrorResonse =
        filePaths.length > 0 ? await fetchFilesContent(owner, repo, filePaths) : [];

    if ('status' in fileContentDataList && 'message' in fileContentDataList) {
        return fileContentDataList;
    }

    let repoData;

    try {
        repoData = await octokit.repos.get({
            owner: owner,
            repo: repo,
        });
    } catch (error: any) {
        return {
            status: error?.error?.status || 400,
            message: error?.error?.response?.data?.message || 'Somthing went wrong',
        };
    }

    return {
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
};

export const createRepoPromptCompactService = async (
    owner: string,
    repo: string,
    filePaths: string[],
    customCommands: string[]
): Promise<string | IErrorResonse> => {
    let responseData;

    try {
        responseData = await createRepoPromptService(owner, repo, filePaths);

        if ('status' in responseData && 'message' in responseData) {
            return responseData;
        }
    } catch (error: any) {
        return {
            status: 400,
            message: 'Somthing went wrong',
        };
    }

    return `
        Name : ${responseData.name}
        Description : ${responseData.description}
        Is Forked : ${responseData.isForked ? 'Yes' : 'No'}
        License : ${responseData.license}
        Topics : ${responseData.topics.toLocaleString()}
        Languages : ${responseData.languages}
        File Contents : 
        ${responseData.fileContentList
            .map((fileContent) => `${fileContent.path}\n${fileContent.content}`)
            .join('\n\n')}
        Custom Commands : 
        ${customCommands.map((customCommand) => `${customCommand}`).join('\n\n')}
    `;
};
