FROM node:22.14.0-alpine

WORKDIR /app

COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE ${PORT}

CMD ["sh", "-c", "NAME=$NAME PORT=$PORT npm start"]