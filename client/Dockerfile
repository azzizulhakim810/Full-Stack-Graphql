# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Install any needed packages
RUN npm install

# Make the container's port 3000 available to the outside world
EXPOSE 3000

# Run the app
CMD ["npm", "start"]