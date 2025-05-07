FROM ollama/ollama:0.6.8

RUN apt-get update && apt-get install -y python3 python3-pip curl
COPY requirements.txt /app/requirements.txt
RUN pip3 install --no-cache-dir -r /app/requirements.txt

WORKDIR /app
COPY Modelfile /app/Modelfile
COPY entrypoint.sh /app/entrypoint.sh
COPY proxy.py /app/proxy.py

RUN chmod +x /app/entrypoint.sh

EXPOSE 11434 8080

ENTRYPOINT ["/app/entrypoint.sh"]
