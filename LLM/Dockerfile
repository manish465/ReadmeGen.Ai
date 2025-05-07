FROM ubuntu:latest

# Set the working directory
WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64 -o ollama && \
    chmod +x ollama && \
    ./ollama serve &

COPY ModelFile /app/ModelFile

EXPOSE 11434

ENTRYPOINT ["/bin/bash", "-c", "./ollama serve & sleep infinity"]
