# PixConvert

PixConvert is a free, privacy-focused, and open-source file conversion tool.
It's built with React, Vite, and Express.

## Docker

The repo now includes a production-ready container setup:

- `Dockerfile`: multi-stage build that compiles the Vite frontend and runs the Express server
- `docker-compose.yml`: app + Nginx edge setup for portable deployment
- `nginx.scaling.conf`: reverse proxy for running multiple app containers

### Run locally in Docker

1. Copy `.env.example` to `.env` and fill in production values.
2. Start the stack:

```bash
docker compose up --build
```

### Scale on another machine

```bash
docker compose up --build --scale app=3 -d
```

This keeps Nginx on port `80` and fans traffic across multiple `app` containers on the same Docker host.

Note: uploaded files are stored in the shared `uploads-data` Docker volume. If you later scale across multiple hosts, move uploads to shared object storage or a shared filesystem.
