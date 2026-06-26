FROM node:26.4.0

WORKDIR /app

# Install build dependencies for sqlite3
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./

# Install and rebuild sqlite3 from source
RUN npm install --build-from-source
RUN npm rebuild sqlite3 --build-from-source

COPY backend/ .

EXPOSE 5000

CMD ["npm", "start"]
