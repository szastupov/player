FROM node

ADD package.json /player/
WORKDIR /player
RUN npm install --production

ADD index.js /player/
ADD dist /player/dist

CMD ["npm", "start"]
