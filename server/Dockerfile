# Use Puppeteer's official base image with all dependencies pre-installed
FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]