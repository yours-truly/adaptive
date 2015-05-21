FROM ubuntu:14.04.2
MAINTAINER Yours Truly Technologie <technologie@yourstruly.de>
LABEL Description="This image is a running version of an adaptive server" Vendor="Yours Truly" Version="0.0.5"

RUN apt-get update && apt-get install -y \
  nodejs=0.10.* \
  npm \
  libcairo2-dev \
  libjpeg8-dev \
  libpango1.0-dev \
  libgif-dev \
  build-essential \
  g++

RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10

ENV WORK /home/server

WORKDIR ${WORK}
COPY . ${WORK}/
RUN npm install

EXPOSE 3000
CMD ["npm", "start"]
