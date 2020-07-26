FROM node:12.17-alpine3.10
WORKDIR /usr/src/node-mq-log
COPY package.json /usr/src/node-mq-log/
RUN npm install
COPY . /usr/src/node-mq-log
CMD ["node", "src/index"]