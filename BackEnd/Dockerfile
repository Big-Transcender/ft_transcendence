FROM node:20

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

CMD [ "sh", "-c", "node src/index.js" ]