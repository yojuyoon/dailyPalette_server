FROM node:20
RUN mkdir -p /var/app
WORKDIR /var/app
COPY package.json .
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
# CMD ["node", "backend/dist/src/main.js"]
