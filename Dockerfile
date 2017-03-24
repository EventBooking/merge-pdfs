FROM node:6.10

MAINTAINER Jordan Brown, jordan.brown@eventbooking.com

RUN apt-get update
RUN apt-get -y install default-jre

WORKDIR /home

ADD package.json package.json
RUN npm install

ADD index.js index.js