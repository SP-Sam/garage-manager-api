FROM node:18.17.0-alpine3.18

RUN adduser --disabled-password --gecos '' appuser

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --quiet --no-optional --no-fund --loglevel=error

COPY . .

RUN chown -R appuser /usr/src/app

USER appuser

RUN yarn generate

RUN yarn build

RUN rm package.json yarn.lock

EXPOSE 3000

CMD [ "node", "dist/src/main.js" ]
