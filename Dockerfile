# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies, including nodemon globally
RUN npm install -g nodemon && npm install

# Copy the rest of the application code
COPY . .

# Make the container's port 4000 available to the outside world
EXPOSE 4000

# Run the app using nodemon
CMD ["nodemon", "index.js"]
