#!/bin/sh

APP=lnw
USER=$APP
GROUP=$USER
APPDIR=/opt/$APP

chown -Rv $USER:$GROUP $APPDIR

export DEBIAN_FRONTEND=noninteractive

apt-get -y install mc jq

