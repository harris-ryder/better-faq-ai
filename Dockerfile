# Define the Node.js version as an argument
ARG NODE_VERSION=20.18.0

# Build stage
FROM node:${NODE_VERSION}-slim as build

# Set the working directory
WORKDIR /usr/src/app

# Copy only the package files first to take advantage of Docker cache
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (using npm ci for a clean install)
RUN npm ci

# Copy the source code
COPY ./src ./src

# Compile TypeScript to JavaScript (in /dist folder)
RUN npx tsc

# Production stage
FROM node:${NODE_VERSION}-slim 

# Set the working directory
WORKDIR /usr/src/app

# Copy only the package files (for production dependencies)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --production

# Copy the compiled code from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Expose the app's port
EXPOSE 8080

# Set the entry point to the compiled TypeScript output
CMD ["node", "dist/index.js"]

