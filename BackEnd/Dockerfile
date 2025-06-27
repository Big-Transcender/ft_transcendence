FROM node:24

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

CMD [ "sh", "-c", "node src/index.js" ]