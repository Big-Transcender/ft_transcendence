# --- Development Stage ---
	FROM node:20 AS build

	WORKDIR /app
	
	# Install deps
	COPY package.json package-lock.json ./
	RUN npm install
	
	# Copy rest of the app
	COPY . .
	
	# Expose port for live-server
	EXPOSE 8080 5173 
	
	RUN npx tsc
	
	FROM debian:bullseye
	
	RUN apt update && apt upgrade -y && apt install -y nginx openssl
	
	COPY --from=build /app/*.html /usr/share/nginx/html/
	COPY --from=build /app/styles/*.css /usr/share/nginx/html/styles/
	COPY --from=build /app/dist/*.js /usr/share/nginx/html/dist/
	COPY --from=build /app/images/ /usr/share/nginx/html/images/
	COPY --from=build /app/audios/ /usr/share/nginx/html/audios/
	COPY --from=build /app/fonts/ /usr/share/nginx/html/fonts/
	
	# Or copy a `dist` or `public` folder:
	COPY --from=build /app/dist/ /usr/share/nginx/html/
	
	RUN rm -f /etc/nginx/sites-enabled/default
	COPY nginx/default.conf /etc/nginx/conf.d/default.conf

	# Copy SSL certs
	COPY nginx/certs/selfsigned.crt /etc/nginx/certs/selfsigned.crt
	COPY nginx/certs/selfsigned.key /etc/nginx/certs/selfsigned.key
	
	CMD ["nginx", "-g", "daemon off;"]