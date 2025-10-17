#!/bin/bash

# Определяем директорию скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Загружаем переменные из .env файла
if [ -f "$SCRIPT_DIR/.env" ]; then
    source "$SCRIPT_DIR/.env"
else
    echo "Error: .env file not found in $SCRIPT_DIR"
    exit 1
fi

export PATH="$HOME/bin:$PATH"

LAUNCH_NAME="Demo Wallet Tests $(date +%Y-%m-%d_%H:%M)"
if [ ! -z "$1" ]; then
    LAUNCH_NAME="$1"
fi

echo "Uploading to Allure TestOps..."
echo "Launch name: $LAUNCH_NAME"

allurectl upload allure-results \
  --endpoint $ALLURE_BASE_URL \
  --token $ALLURE_API_TOKEN \
  --project-id $ALLURE_PROJECT_ID \
  --launch-name "$LAUNCH_NAME"
