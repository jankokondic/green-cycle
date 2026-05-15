FROM node:22-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 55555

CMD ["node", "index.js"]