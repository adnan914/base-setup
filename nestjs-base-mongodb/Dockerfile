FROM node:22

WORKDIR /app

RUN rm -rf node_modules package-lock.json dist

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run" ,"start:dev"]