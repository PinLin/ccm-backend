FROM node:22.19.0-alpine3.22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --production
EXPOSE 3000
CMD npm run start:prod
