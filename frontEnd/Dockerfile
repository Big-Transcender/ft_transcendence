# --- Development Stage ---
FROM node:20

WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose port for live-server
EXPOSE 3000

# Install live-server globally (optional if used via npx)
RUN npm install -g live-server concurrently

# Default command: run tsc in watch mode + serve
CMD ["concurrently", "npx tsc -w", "live-server --host=0.0.0.0 --port=3000 --open=./index.html"]


# RUN npx tsc

# FROM debian:bullseye

# RUN apt update && apt upgrade -y && apt install -y nginx

# COPY --from=build /app/*.html /usr/share/nginx/html/
# COPY --from=build /app/styles/*.css /usr/share/nginx/html/styles/
# COPY --from=build /app/dist/*.js /usr/share/nginx/html/
# COPY --from=build /app/images/ /usr/share/nginx/html/images/
# COPY --from=build /app/audios/ /usr/share/nginx/html/audios/
# COPY --from=build /app/fonts/ /usr/share/nginx/html/fonts/

# # Or copy a `dist` or `public` folder:
# # COPY --from=build /app/dist/ /usr/share/nginx/html/

# RUN rm -f /etc/nginx/sites-enabled/default
# COPY ./default.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]