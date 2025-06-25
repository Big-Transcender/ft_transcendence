FROM node:20 AS build

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npx tsc

# --------- RUNTIME IMAGE ---------
FROM debian:bullseye

# Install dependencies
RUN apt update && apt upgrade -y && apt install -y \
    nginx \
    git \
    g++ \
    make \
    cmake \
    libtool \
    libpcre3-dev \
    libpcre2-dev \
    libxml2-dev \
    libyajl-dev \
    zlib1g-dev \
    curl \
    automake \
    pkgconf \
    libcurl4-openssl-dev \
    libgeoip-dev \
    liblmdb-dev \
    libpcre++-dev \
    liblua5.3-dev \
    wget \
    ca-certificates

# Clone and build ModSecurity v3 (libmodsecurity)
WORKDIR /opt
RUN git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity && \
    cd ModSecurity && \
    git submodule init && \
    git submodule update && \
    ./build.sh && \
    ./configure && \
    make && make install

# Clone and build ModSecurity Nginx connector
RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# Download nginx source and extract version to match installed nginx
RUN apt install -y nginx-core && \
    NGINX_VERSION=$(nginx -v 2>&1 | grep -o '[0-9.]*') && \
    wget http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz && \
    tar zxvf nginx-$NGINX_VERSION.tar.gz && \
    cd nginx-$NGINX_VERSION && \
    ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx && \
    make modules && \
    mkdir -p /usr/share/nginx/modules && \
    cp objs/ngx_http_modsecurity_module.so /usr/share/nginx/modules/

# Copy frontend files from build
COPY --from=build /app/*.html /usr/share/nginx/html/
COPY --from=build /app/styles/*.css /usr/share/nginx/html/styles/
COPY --from=build /app/dist/*.js /usr/share/nginx/html/
COPY --from=build /app/images/ /usr/share/nginx/html/images/
COPY --from=build /app/audios/ /usr/share/nginx/html/audios/
COPY --from=build /app/fonts/ /usr/share/nginx/html/fonts/

# Remove default config and add custom one
RUN rm -f /etc/nginx/sites-enabled/default
COPY ./default.conf /etc/nginx/conf.d/default.conf

# OWASP Core Rule Set (CRS)
RUN git clone --depth 1 https://github.com/coreruleset/coreruleset.git /etc/nginx/modsec/crs
RUN cp /etc/nginx/modsec/crs/crs-setup.conf.example /etc/nginx/modsec/crs/crs-setup.conf

# Add ModSecurity config files
COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY unicode.mapping /etc/nginx/modsec/unicode.mapping

# Enable modsecurity in nginx
RUN echo "load_module modules/ngx_http_modsecurity_module.so;" | cat - /etc/nginx/nginx.conf > temp && mv temp /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
