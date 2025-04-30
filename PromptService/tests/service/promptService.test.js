const { prompt, healthCheck } = require("../../src/service/promptService");
const { Octokit } = require("@octokit/rest");

jest.mock("@octokit/rest");

describe("Prompt Generator Service", () => {
    let mockReq;
    let mockRes;
    let mockOctokit;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            query: {
                owner: "testowner",
                repo: "testrepo",
            },
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockOctokit = {
            repos: {
                get: jest.fn(),
                getContent: jest.fn(),
                listLanguages: jest.fn(),
            },
        };

        Octokit.mockImplementation(() => mockOctokit);
    });

    describe("prompt endpoint", () => {
        // Existing test cases...

        it("should handle empty repository data gracefully", async () => {
            mockOctokit.repos.get.mockResolvedValue({
                data: {
                    name: "testrepo",
                    description: null,
                    stargazers_count: 0,
                    forks_count: 0,
                    topics: [],
                },
            });

            mockOctokit.repos.getContent.mockResolvedValue({ data: [] });
            mockOctokit.repos.listLanguages.mockResolvedValue({ data: {} });

            await prompt(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "testrepo",
                    description: "",
                    stars: 0,
                    forks: 0,
                    topics: [],
                    languages: [],
                }),
            );
        });

        it("should handle invalid repository content", async () => {
            mockOctokit.repos.get.mockResolvedValue({
                data: {
                    name: "testrepo",
                    description: "Test Description",
                    stargazers_count: 100,
                    forks_count: 50,
                    topics: ["javascript"],
                },
            });

            mockOctokit.repos.getContent.mockRejectedValue(
                new Error("Invalid content"),
            );
            mockOctokit.repos.listLanguages.mockResolvedValue({
                data: { JavaScript: 1000 },
            });

            await prompt(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: "Failed to ingest repository",
            });
        });

        it("should handle rate limiting errors", async () => {
            const rateLimitError = new Error("API rate limit exceeded");
            rateLimitError.status = 403;
            mockOctokit.repos.get.mockRejectedValue(rateLimitError);

            await prompt(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: "API rate limit exceeded",
            });
        });

        it("should handle malformed response data", async () => {
            mockOctokit.repos.get.mockResolvedValue({
                data: {
                    name: "testrepo",
                    // Missing other required fields
                },
            });

            await prompt(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: "Failed to ingest repository",
            });
        });
    });

    describe("healthCheck endpoint", () => {
        // Existing test case...

        it("should include timestamp in response", () => {
            const before = new Date();
            healthCheck(mockReq, mockRes);
            const after = new Date();

            const response = mockRes.json.mock.calls[0][0];
            const timestamp = new Date(response.timestamp);

            expect(timestamp).toBeInstanceOf(Date);
            expect(timestamp >= before && timestamp <= after).toBeTruthy();
        });
    });
});
