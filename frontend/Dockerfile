FROM node:20.17.0

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm install
RUN npm i -g serve

COPY . /app/

RUN npm run build

EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]