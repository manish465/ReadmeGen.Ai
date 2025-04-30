const { Octokit } = require("@octokit/rest");
const { detectStack } = require("../utils/lang");

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

exports.prompt = async (req, res) => {
    const { owner, repo } = req.query;

    if (!owner || !repo) {
        return res.status(400).json({ error: "owner and repo are required" });
    }

    try {
        // 1. Get repo metadata
        const { data: repoData } = await octokit.repos.get({ owner, repo });

        // 2. Get root content
        const { data: contents } = await octokit.repos.getContent({
            owner,
            repo,
            path: "",
        });

        // 3. Filter key files
        const files = await Promise.all(
            contents.map(async (item) => {
                if (item.type === "file") {
                    if (
                        item.name.match(/\.(js|ts|py|json|md|yml)$/) ||
                        ["Dockerfile", "Makefile"].includes(item.name)
                    ) {
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
                            content: content.substring(0, 1000), // truncate to first 1k chars
                        };
                    }
                }
            }),
        );

        const { data: langData } = await octokit.repos.listLanguages({
            owner,
            repo,
        });

        res.json({
            name: repoData.name,
            description: repoData.description,
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            topics: repoData.topics,
            files: files.filter(Boolean),
            languages: Object.keys(langData),
            detectedStack: detectStack(Object.keys(langData), files),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to ingest repository" });
    }
};

exports.healthCheck = async (req, res) => {
    return res.status(200).send({ message: "Prompt Service is running" });
};
