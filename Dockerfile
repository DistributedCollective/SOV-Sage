FROM node:12-slim

RUN apt-get update && apt-get -y install procps

WORKDIR /app

# Add our package.json and install *before* adding our application files
COPY ["package.json", "package-lock.json*", "./"]

RUN npm install pm2 -g
RUN npm install --production

# Now add application files
COPY . /app

# Expose the port
#EXPOSE 3000

# ENTRYPOINT ["bash", "docker-entrypoint.sh"]

CMD ["sh", "-c", "pm2-runtime --node-args=\"-r esm\" server.js"]
