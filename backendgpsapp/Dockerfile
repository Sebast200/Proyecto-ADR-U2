FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies (only production dependencies)
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
