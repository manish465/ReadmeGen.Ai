# ReadMeGen.AI

A microservices-based application that automatically generates comprehensive README files for GitHub repositories using AI.

## Features

- Fetch repository information and file contents from GitHub
- Generate professional README.md files using AI (Ollama/Gemma)
- Customizable file path inclusion for better context
- Support for custom commands/instructions
- Modern React frontend with real-time preview
- Downloadable README output
- CI/CD pipeline with GitHub Actions

## Tech Stack

### Backend
- Java 17 (Spring Boot 3.4.5)
- Node.js/TypeScript
- Spring AI with Ollama integration
- Consul for service discovery
- Docker & Docker Compose

### Frontend
- React 19
- TypeScript
- Axios for API communication
- SCSS for styling

### AI
- Ollama
- Gemma 3 (1B parameter model)

## Architecture

The application consists of several microservices:

1. **Prompt Service**: Node.js service that fetches repository data from GitHub
2. **Readme Service**: Spring Boot service that processes data and generates README content
3. **LLM Service**: Ollama container running Gemma 3:1b model
4. **Frontend**: React application for user interaction
5. **Consul**: Service discovery and registration

## Setup Instructions

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/username/ReadMeGen.AI.git
   cd ReadMeGen.AI
   ```

2. Start the application using Docker Compose:
   ```
   cd docker
   docker-compose up -d
   ```

3. Access the application at http://localhost:80

## Usage

1. Enter the GitHub repository URL in the form
2. Add specific file paths to improve context (optional)
3. Add custom information or commands (optional)
4. Click "Generate Readme.md"
5. View and download the generated README file

## Development

### Building Individual Services

#### Prompt Service (Node.js)
```
cd PromptService
npm install
npm run build
npm start
```

#### Readme Service (Spring Boot)
```
cd ReadmeService
./mvnw clean package
java -jar target/ReadmeService.jar
```

#### Frontend
```
cd readme-gen-frontend
npm install
npm start
```

## CI/CD

The project includes GitHub Actions workflows for continuous integration:

- **Prompt Service Tests**: Runs tests for the Node.js Prompt Service
- **Readme Service Tests**: Builds and tests the Spring Boot Readme Service
- **Frontend Tests**: Runs React testing suite for the frontend

Tests are automatically run on pull requests to the master branch.

## License

This project is open source and available under the ISC License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request using the provided template

When submitting a pull request, please use the pull request template which asks for:
- Description of changes
- Related issue reference
- Type of change (bug fix, feature, etc.)
- Screenshots if applicable
- Checklist for code quality and testing
