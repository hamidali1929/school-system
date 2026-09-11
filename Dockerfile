FROM node:18-alpine

WORKDIR /app

# Create a user with UID 1000 (Required by Hugging Face Spaces)
RUN adduser -D -u 1000 user

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

COPY server/ .

# Change ownership to the new user
RUN chown -R user:user /app
USER user

ENV PORT=7860

EXPOSE 7860

CMD [" node\, \index.js\]