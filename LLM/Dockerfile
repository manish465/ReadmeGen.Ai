FROM ollama/ollama:latest

EXPOSE 11434

ENTRYPOINT ["/bin/bash", "-c"]
CMD ["ollama serve & sleep 5 && ollama pull gemma3:1b && tail -f /dev/null"]