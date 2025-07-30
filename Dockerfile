# Install deps
FROM node:18-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build stage
FROM node:18-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate and DB sync 
RUN npx prisma db push
RUN npx prisma generate

# Next.js build
RUN npm run build

# Final runtime image
FROM node:18-slim AS runner
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
