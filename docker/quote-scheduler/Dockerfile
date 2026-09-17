FROM node:20-alpine

WORKDIR /app

COPY web_source/BE/quote-scheduler/package.json ./package.json
RUN npm install

COPY web_source/BE/quote-scheduler/ ./

CMD ["node", "scheduler.js"]
