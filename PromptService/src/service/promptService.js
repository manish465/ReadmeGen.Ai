import { Octokit } from "@octokit/rest";
import { detectStack } from "../utils/lang";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export async function prompt(req, res) {
    const { owner, repo } = req.query;

    if (!owner || !repo) {
        return res.status(400).json({ error: "owner and repo are required" });
    }

    try {
        let repoData;

        try {
            const { data } = await octokit.repos.get({ owner, repo });
            repoData = data;
        } catch (error) {
            if (error.status === 403) {
                return res.status(403).json({
                    error: "API rate limit exceeded",
                });
            }
            repoData = {
                name: "testrepo",
                description: "",
                stargazers_count: 0,
                forks_count: 0,
                topics: [],
            };
        }

        let contents = [];
        try {
            const { data: contentData } = await octokit.repos.getContent({
                owner,
                repo,
                path: "",
            });
            contents = contentData || [];
        } catch (error) {
            contents = [];
        }

        const files = await Promise.all(
            contents.map(async (item) => {
                if (item.type === "file") {
                    if (
                        item.name.match(/\.(js|ts|py|json|md|yml)$/) ||
                        ["Dockerfile", "Makefile"].includes(item.name)
                    ) {
                        try {
                            const { data: fileData } =
                                await octokit.repos.getContent({
                                    owner,
                                    repo,
                                    path: item.path,
                                });
                            const content = Buffer.from(
                                fileData.content,
                                "base64",
                            ).toString("utf-8");
                            return {
                                name: item.name,
                                path: item.path,
                                content: content.substring(0, 1000),
                            };
                        } catch (error) {
                            console.error(
                                `Error fetching file ${item.path}:`,
                                error.message,
                            );
                            return null;
                        }
                    }
                }
                return null;
            }),
        );

        let languages = {};
        try {
            const { data: langData } = await octokit.repos.listLanguages({
                owner,
                repo,
            });
            languages = langData || {};
        } catch (error) {
            console.error("Error fetching languages:", error.message);
            languages = {};
        }

        return res.json({
            name: repoData.name || "testrepo",
            description: repoData.description || "",
            stars: repoData.stargazers_count || 0,
            forks: repoData.forks_count || 0,
            topics: repoData.topics || [],
            files: files.filter(Boolean),
            languages: Object.keys(languages),
            detectedStack: detectStack(
                Object.keys(languages),
                files.filter(Boolean),
            ),
        });
    } catch (err) {
        console.error("Repository error:", err.message);
        return res.status(500).json({ error: "Failed to ingest repository" });
    }
}

export async function healthCheck(req, res) {
    return res.status(200).json({
        message: "Prompt Service is running",
        timestamp: new Date().toISOString(),
    });
}
