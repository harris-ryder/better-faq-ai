FROM node:23.5-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "--experimental-strip-types", "--experimental-transform-types", "src/index.ts"]

