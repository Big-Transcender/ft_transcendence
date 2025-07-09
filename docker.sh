#!/bin/bash
# filepath: /home/diogosan/02Git_Clone/ft_transcendence/docker.sh

if [ "$1" == "up" ]; then
    echo "Running 'docker compose up --build'..."
    docker compose up --build
elif [ "$1" == "clean" ]; then
    echo "Running 'docker system prune -a'..."
    docker system prune -a
else
    echo "Usage: ./docker.sh [up|clean]"
    echo "  up    - Run 'docker compose up --build'"
    echo "  clean - Run 'docker system prune -a'"
    exit 1
fi