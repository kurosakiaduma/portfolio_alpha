#!/bin/bash
set -e

# Start Ollama in the background
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready before pulling the model
echo "Waiting for Ollama to be ready..."
until curl -sf http://localhost:11434/api/tags > /dev/null 2>&1; do
  echo "."
  sleep 1
done

echo "Ollama ready. Pulling model..."
ollama pull mistral:7b-instruct

wait "$OLLAMA_PID"
