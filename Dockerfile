FROM node

ENV NPM_CONFIG_LOGLEVEL warn
ARG app_env
ENV NODE_ENV $app_env

RUN mkdir -p /app
WORKDIR /app
COPY ./ ./

RUN npm install

CMD npm run build && \
	npm start

EXPOSE 80
