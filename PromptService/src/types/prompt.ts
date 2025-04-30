export interface IOctokitGetRepoDataInput {
    owner: string;
    repoName: string;
}

export interface IContentError {
    status: number | null;
    errorMessage: string | null;
}
