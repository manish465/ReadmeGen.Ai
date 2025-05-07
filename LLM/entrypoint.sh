#!/bin/sh

ollama serve &

until curl -s http://localhost:11434 > /dev/null; do
  echo "Waiting for Ollama..."
  sleep 1
done

if ! ollama list | grep -q "readme-writer"; then
  echo "Creating 'readme-writer' model from Modelfile..."
  ollama create readme-writer -f /app/Modelfile
else
  echo "'readme-writer' model already exists."
fi

python3 /app/proxy.py
