FROM node:20-alpine
WORKDIR /repo

COPY package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm install --workspace apps/web --workspace packages/shared --include-workspace-root

COPY packages/shared packages/shared
COPY apps/web apps/web

WORKDIR /repo/apps/web
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
