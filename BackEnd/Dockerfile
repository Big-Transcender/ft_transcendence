FROM node:20

COPY package.json .
COPY package-lock.json .

RUN npm install 20

COPY . .

CMD [ "sh", "node src/index.js" ]