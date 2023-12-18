FROM node:slim

# Copy package.json and package-lock.json
COPY package.json ./

# Install npm production packages
RUN npm install

COPY . .

ENV NODE_ENV production

ENTRYPOINT ["npm", "start"]
