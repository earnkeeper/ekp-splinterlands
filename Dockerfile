FROM node:16.13.1

WORKDIR /app 

COPY package.json /app 
COPY package-lock.json /app

RUN npm ci

COPY . /app 

RUN npm run build

CMD ["node","dist/main"]