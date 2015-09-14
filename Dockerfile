FROM node:0.12.7
MAINTAINER Yours Truly Technologie <technologie@yourstruly.de>
LABEL Description="This image is a running version of an adaptive server" Vendor="Yours Truly" Version="0.0.5"

RUN apt-get update && apt-get install -y \
  runit \
  libcairo2-dev \
  libjpeg62-turbo-dev \
  libpango1.0-dev \
  libgif-dev \
  build-essential \
  g++ \
&& apt-get autoremove -y && apt-get clean \
&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV WORK /opt/src

WORKDIR ${WORK}
COPY . ${WORK}/
RUN npm install

ENTRYPOINT ["chpst", "-u", "nobody", "./bin/adaptive"]

CMD [""]
