FROM mcr.microsoft.com/devcontainers/base:trixie

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        npm \
        python3 \
        python3-pip \
        mariadb-server \
        mariadb-client \
    && rm -rf /var/lib/apt/lists/*
