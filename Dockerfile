FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3030

CMD ["npm", "run", "start:prod"]
