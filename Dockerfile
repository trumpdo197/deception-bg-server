# pull official base image
FROM node:14

# set working directory
WORKDIR /app

# add app
COPY . ./

RUN npm install
RUN npm install forever -g

RUN ls -la
# start app
CMD ["node", "index.js"]

EXPOSE 80