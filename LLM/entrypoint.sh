#!/bin/sh

if ! ollama list | grep -q "readme-writer"; then
  echo "Model not found. Creating 'readme-writer' model..."
  ollama create readme-writer -f /app/Modelfile
else
  echo "Model already exists. Skipping creation."
fi

ollama serve