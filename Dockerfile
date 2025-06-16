FROM node

ENV NPM_CONFIG_LOGLEVEL warn
ARG app_env
ENV NODE_ENV $app_env

RUN mkdir -p /app
WORKDIR /app
COPY ./ ./

RUN npm install -g yarn
RUN yarn install

CMD yarn build && \
	yarn start

EXPOSE 80
