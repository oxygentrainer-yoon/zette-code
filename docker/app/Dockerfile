FROM node:22-alpine

WORKDIR /app

COPY web_source/FE/package*.json ./
RUN npm install

COPY web_source/FE/server.js ./server.js
COPY web_source/BE/app.js ./app.js
COPY web_source/BE/fetchDB.js ./services/fetchDB.js
COPY docker/app/start.sh ./start.sh

RUN chmod +x ./start.sh

EXPOSE 3000

CMD ["./start.sh"]
