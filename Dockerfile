FROM node:7.8.0

MAINTAINER Jordan Brown, jordan.brown@eventbooking.com

RUN apt-get update
RUN apt-get install -y pdftk

WORKDIR /home

ADD package.json package.json
RUN npm install