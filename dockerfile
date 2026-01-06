# Dockerfile
FROM node:18-alpine
WORKDIR /USR/SRC/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]