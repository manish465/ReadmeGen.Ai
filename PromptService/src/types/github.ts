export interface ICreatePromptResponse {
    name: string;
    description: string;
    languages: string;
    license: string;
    isForked: boolean;
    topics: string[];
    fileContentList: IFileContentList[];
}

export interface IFileContentList {
    path: string;
    content: string | null;
}
