# Use Puppeteer's official base image with all dependencies pre-installed
FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Change ownership to pptruser (the default user in puppeteer image)
USER root
RUN chown -R pptruser:pptruser /usr/src/app

# Switch to pptruser for npm commands
USER pptruser

# Install dependencies
RUN npm install

# Copy source code and change ownership
USER root
COPY . .
RUN chown -R pptruser:pptruser /usr/src/app

# Switch back to pptruser
USER pptruser

# Build TypeScript
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]