# Use Puppeteer's official base image with all dependencies pre-installed
FROM ghcr.io/puppeteer/puppeteer:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY --chown=pptruser:pptruser package*.json ./

# Install dependencies
RUN npm install

# Copy all files and build the TypeScript project
COPY --chown=pptruser:pptruser . .
RUN npx tsc

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/app.js"]