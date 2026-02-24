# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy the built React app to Nginx's web folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the web port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]