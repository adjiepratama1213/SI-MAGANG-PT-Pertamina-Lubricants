# Stage 1: Base image with Node.js and dependencies
FROM node:lts
RUN npm i -g npm@latest
WORKDIR /app
COPY package*.json .
RUN npm i -g serve
RUN npm install --legacy-peer-deps --verbose
COPY . .

# ENV VITE_HOST_API=$API_URL
# ENV VITE_PRODUCT_API=$API_PRODUCT_URL
# ENV VITE_PRODUCT_KEY=$API_PRODUCT_KEY

RUN npm run build

# RUN npm install -g serve

EXPOSE 80
EXPOSE 8080
# EXPOSE 3000
# CMD [ "npm", "run", "start"]
# CMD ["npm", "build:run"]
CMD ["serve", "-s", "dist", "-l", "8080"]
# CMD [ "npm", "run", "start:prod"]
