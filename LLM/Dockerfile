FROM ollama/ollama:0.6.7

WORKDIR /app
COPY Modelfile /app/Modelfile
COPY entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

EXPOSE 11434
ENTRYPOINT ["/app/entrypoint.sh"]
