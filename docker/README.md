Docker usage for the Optivus Next.js app

Quick start (production image):

1. Build the image

   docker build -t optivus:latest .

2. Run the container

   docker run -p 3000:3000 --env-file .env.production optivus:latest

Notes:
- The Dockerfile builds the app with `npm run build` and runs it with `npm start` (Next's `next start`).
- Provide runtime environment variables via an env file (example: `.env.production`). Do NOT commit secrets to the repo.

Development using Docker Compose:

  docker compose up app-dev

This will mount your source into the container and run `npm run dev`.

Tips:
- If you use a different package manager (pnpm/yarn), adjust the Dockerfile accordingly.
- If you need server-side services (database), add them to `docker-compose.yml` and configure environment variables.
