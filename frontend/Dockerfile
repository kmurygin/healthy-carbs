# Build stage
FROM node:23-alpine as build
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps && npm run build --prod

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/healthy-carbs/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf