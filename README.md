# Retromachina backend

## Key technologies:
- REST API (teams / users / retros etc.)
- DB - Prisma 
- websockets (retros / boards)
- auth via Google OAuth 2.0
- JWT tokens

## Requirements:
- node >= 18
- docker

## Development

- create `.env` file in root directory based on `.env.template`
- run `docker-compose.local.yaml` using 
  ```bash
  docker-compose up -d -f .docker/docker-compose.local.yaml
  ```
- run npm scripts:
  ```bash
  npm run prisma:init
  npm run start:dev
  ```
