FROM node:21-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps    
COPY . .    
RUN npx prisma generate
RUN npm run build
  
FROM node:21-alpine AS runner
WORKDIR /app    
RUN apk add --no-cache openssl
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
 
ENV NODE_ENV=production
EXPOSE 3000
    
CMD ["sh", "-c", "npx prisma db push && npx prisma generate && npm start"]
    