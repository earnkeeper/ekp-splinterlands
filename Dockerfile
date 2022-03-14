FROM node:16.13.1

WORKDIR /app 

COPY package.json /app 
COPY package-lock.json /app

RUN npm ci

COPY ./src /app 
COPY ./LICENSE /app 
COPY ./nest-cli.json /app 
COPY ./README.md /app 
COPY ./tsconfig.build.json /app 
COPY ./tsconfig.json /app 

RUN npm run build

CMD ["npm","run","start:prod"]