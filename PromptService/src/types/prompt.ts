export interface IOctokitGetRepoDataInput {
    owner: string;
    repoName: string;
}

export interface ICreateRepoPromptCompact {
    repo: string;
    filePaths: string;
    customCommands: string;
}

export interface IErrorResonse {
    status: number;
    message: string;
}
