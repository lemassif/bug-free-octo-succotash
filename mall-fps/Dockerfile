# Game server image for Fly.io. Build from the mall-fps folder:
#   fly deploy        (or: docker build -t bfb-server .)

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY shared ./shared
COPY server ./server
COPY client/package.json ./client/package.json
RUN npm ci --ignore-scripts --no-audit --no-fund
# Bundles the server and the shared game code into one file.
RUN npm run build -w server
# A package.json for the bundle with only the real npm dependencies.
RUN cp server/package.json server/dist/package.json \
 && cd server/dist \
 && npm pkg delete "dependencies.@bfb/shared" devDependencies scripts

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=build /app/server/dist ./
RUN npm install --omit=dev --no-audit --no-fund
EXPOSE 8080
CMD ["node", "index.js"]
