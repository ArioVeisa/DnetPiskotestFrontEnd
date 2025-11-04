FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy the rest of the app (during build-only steps). At runtime we'll mount the code for HMR.
COPY . .

EXPOSE 3000

ENV HOST=0.0.0.0

CMD ["npm", "run", "dev"]




