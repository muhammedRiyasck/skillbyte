# Stage 1: Build the server application
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production environment
FROM node:18-alpine

# Install FFmpeg for video processing
RUN apk update && apk add --no-cache ffmpeg

WORKDIR /app

# Copy package.json and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the built output from builder
COPY --from=builder /app/dist ./dist

# Create necessary directories for local temporary storage if needed
RUN mkdir -p uploads temp-transcode logs

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
