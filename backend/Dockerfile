# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001 && chown -R nodeuser:nodejs /app
USER nodeuser
ENV PORT=3000
ENV DB_HOST=database
ENV DB_PORT=5432
# Other DB vars set via Compose
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "app.js"]