# Stage 1: Building the code
FROM node:20-alpine AS builder

WORKDIR /app

# Add build arguments
ARG NEXT_PUBLIC_APP_URL
ARG MONGODB_URI
ARG DB_NAME
ARG NEXT_PUBLIC_LIFF_ID
ARG LIFF_URL
ARG LINE_SECRET
ARG LINE_ACCESS_TOKEN
ARG NEXT_PUBLIC_BASE_API_URL
ARG NEXT_PUBLIC_BASE_API_KEY
ARG EXTERNAL_API_URL
ARG EXTERNAL_API_KEY
ARG NEXT_PUBLIC_BASE_REGISTER_URL
ARG NEXT_PUBLIC_LINE_AT
ARG NEXT_PUBLIC_AFF_URL
ARG NEXT_PUBLIC_ADMIN_AFF_URL

# Set environment variables
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV MONGODB_URI=$MONGODB_URI
ENV DB_NAME=$DB_NAME
ENV NEXT_PUBLIC_LIFF_ID=$NEXT_PUBLIC_LIFF_ID
ENV LIFF_URL=$LIFF_URL
ENV LINE_SECRET=$LINE_SECRET
ENV LINE_ACCESS_TOKEN=$LINE_ACCESS_TOKEN
ENV NEXT_PUBLIC_BASE_API_URL=$NEXT_PUBLIC_BASE_API_URL
ENV NEXT_PUBLIC_BASE_API_KEY=$NEXT_PUBLIC_BASE_API_KEY
ENV EXTERNAL_API_URL=$EXTERNAL_API_URL
ENV EXTERNAL_API_KEY=$EXTERNAL_API_KEY
ENV NEXT_PUBLIC_BASE_REGISTER_URL=$NEXT_PUBLIC_BASE_REGISTER_URL
ENV NEXT_PUBLIC_LINE_AT=$NEXT_PUBLIC_LINE_AT
ENV NEXT_PUBLIC_AFF_URL=$NEXT_PUBLIC_AFF_URL
ENV NEXT_PUBLIC_ADMIN_AFF_URL=$NEXT_PUBLIC_ADMIN_AFF_URL

# Copy package files
COPY package*.json ./
COPY . .

# Install dependencies
RUN npm ci

# Build project
RUN npm run build

# Stage 2: Run the built application
FROM node:20-alpine AS runner

WORKDIR /app

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Copy project-specific files/folders based on your imports
COPY --from=builder /app/src/components ./src/components
COPY --from=builder /app/src/@core ./src/@core
COPY --from=builder /app/src/@layouts ./src/@layouts
COPY --from=builder /app/src/views ./src/views
# Add other necessary folders based on your project structure

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
