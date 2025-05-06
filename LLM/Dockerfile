FROM alpine/ollama:llama3.2

WORKDIR /app
COPY Modelfile /app/Modelfile
COPY entrypoint.sh /app/entrypoint.sh

RUN ls -la /app

RUN chmod +x /app/entrypoint.sh

EXPOSE 11434
ENTRYPOINT ["/app/entrypoint.sh"]