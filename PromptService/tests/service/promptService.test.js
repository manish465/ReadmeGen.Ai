import { jest } from "@jest/globals";
import { prompt, healthCheck } from "../../src/service/promptService";
import { Octokit } from "@octokit/rest";

jest.mock("@octokit/rest");
jest.mock("../../src/utils/lang", () => ({
    detectStack: jest.fn(() => ["nodejs", "react"]),
}));

describe("Repository Prompt API", () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            query: {},
        };

        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    test("should return 400 if owner or repo is missing", async () => {
        await prompt(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "owner and repo are required",
        });
    });

    test("should handle successful repository data fetch", async () => {
        mockReq.query = {
            owner: "testowner",
            repo: "testrepo",
        };

        const mockRepoData = {
            data: {
                name: "testrepo",
                description: "Test Repository",
                stargazers_count: 100,
                forks_count: 50,
                topics: ["javascript", "testing"],
            },
        };

        const mockContents = {
            data: [
                {
                    type: "file",
                    name: "package.json",
                    path: "package.json",
                },
            ],
        };

        const mockFileContent = {
            data: {
                content: Buffer.from('{"name": "test"}').toString("base64"),
            },
        };

        const mockLanguages = {
            data: {
                JavaScript: 100000,
                TypeScript: 50000,
            },
        };

        Octokit.mockImplementation(() => ({
            repos: {
                get: jest.fn().mockResolvedValue(mockRepoData),
                getContent: jest
                    .fn()
                    .mockResolvedValueOnce(mockContents)
                    .mockResolvedValueOnce(mockFileContent),
                listLanguages: jest.fn().mockResolvedValue(mockLanguages),
            },
        }));

        await prompt(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "testrepo",
                description: "Test Repository",
                stars: 100,
                forks: 50,
                topics: ["javascript", "testing"],
                languages: ["JavaScript", "TypeScript"],
                detectedStack: ["nodejs", "react"],
            }),
        );
    });

    test("should handle rate limit error", async () => {
        mockReq.query = {
            owner: "testowner",
            repo: "testrepo",
        };

        Octokit.mockImplementation(() => ({
            repos: {
                get: jest.fn().mockRejectedValue({
                    status: 403,
                }),
            },
        }));

        await prompt(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "API rate limit exceeded",
        });
    });

    test("should handle repository not found error gracefully", async () => {
        mockReq.query = {
            owner: "testowner",
            repo: "testrepo",
        };

        Octokit.mockImplementation(() => ({
            repos: {
                get: jest.fn().mockRejectedValue({
                    status: 404,
                }),
                getContent: jest.fn().mockResolvedValue({ data: [] }),
                listLanguages: jest.fn().mockResolvedValue({ data: {} }),
            },
        }));

        await prompt(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "testrepo",
                description: "",
                stars: 0,
                forks: 0,
                topics: [],
                files: [],
                languages: [],
                detectedStack: ["nodejs", "react"],
            }),
        );
    });

    test("healthCheck should return 200 status", async () => {
        await healthCheck(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: "Prompt Service is running",
            timestamp: expect.any(String),
        });
    });
});
