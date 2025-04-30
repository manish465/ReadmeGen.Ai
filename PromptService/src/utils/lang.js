exports.detectStack = (languages = [], files = []) => {
    const stack = new Set();

    // --- Language-based inference ---
    if (languages.includes("JavaScript")) stack.add("Node.js");
    if (languages.includes("TypeScript")) stack.add("TypeScript");
    if (languages.includes("Python")) stack.add("Python");
    if (languages.includes("Java")) stack.add("Java");
    if (languages.includes("C++")) stack.add("C++");
    if (languages.includes("C#")) stack.add(".NET");
    if (languages.includes("Go")) stack.add("Go");
    if (languages.includes("Ruby")) stack.add("Ruby");

    // --- File-based inference ---
    const fileNames = files.map((f) => f.name);

    if (fileNames.includes("Dockerfile")) stack.add("Docker");
    if (fileNames.includes("docker-compose.yml")) stack.add("Docker Compose");
    if (fileNames.includes("package.json")) stack.add("npm/Yarn");
    if (fileNames.includes("yarn.lock")) stack.add("Yarn");
    if (fileNames.includes("pnpm-lock.yaml")) stack.add("pnpm");
    if (fileNames.includes("requirements.txt")) stack.add("pip");
    if (fileNames.includes("Pipfile")) stack.add("Pipenv");
    if (fileNames.includes("poetry.lock")) stack.add("Poetry");
    if (fileNames.includes("pyproject.toml")) stack.add("PEP 518");
    if (fileNames.includes("pom.xml")) stack.add("Maven");
    if (fileNames.includes("build.gradle")) stack.add("Gradle");
    if (fileNames.includes("Makefile")) stack.add("Make");
    if (fileNames.includes("tsconfig.json")) stack.add("TypeScript Config");
    if (fileNames.includes("vite.config.js")) stack.add("Vite");
    if (fileNames.includes("next.config.js")) stack.add("Next.js");
    if (fileNames.includes("webpack.config.js")) stack.add("Webpack");

    return Array.from(stack);
};
