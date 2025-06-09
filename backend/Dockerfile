# Use the official Node.js image as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables (optional)
ENV NODE_ENV=production
ENV JWT_SECRET=your_jwt_secret_key # Replace with your actual secret key

# Start the application
CMD ["npm", "start"]
