# Use an official Node runtime as a parent image
FROM node:20-bullseye-slim AS builder
# Set working directory
WORKDIR /app
# Copy package manifests and install dependencies for build
COPY package.json package-lock.json* ./
RUN npm install
# Copy the rest of the sources
COPY . .
# Build the Next.js app
RUN npm run build

# Production image
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need to run the app
COPY package.json package-lock.json* ./
# Install only production dependencies in the runner
RUN npm install --production

# Copy built next files and public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.js ./next.config.js  # Commented out - file doesn't exist

# (Optional) copy environment files if you want them baked into the image
# COPY --from=builder /app/.env.production ./.env.production
COPY --from=builder .env.local ./.env.local

EXPOSE 3000

# Use the Next.js start script (defined in package.json as "start": "next start")
CMD ["npm", "start"]
