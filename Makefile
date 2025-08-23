# Variables
BACKEND_DIR=BackEnd
DOCKER_COMPOSE_CMD=docker compose up --build

# Default target
all: generate-key docker-up

# Generate the not-so-secret-key
generate-key:
	cd $(BACKEND_DIR) && node -e "require('fs').writeFileSync('src/not-so-secret-key', require('crypto').randomBytes(32))"

# Run Docker Compose
docker-up:
	$(DOCKER_COMPOSE_CMD)

# Clean Docker system
clean:
	docker system prune -a -f

.PHONY: all generate-key docker-up clean