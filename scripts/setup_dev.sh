#!/bin/sh

APP=lnw
DATADIR=/var/lib/$APP
HOMEDIR=$DATADIR
USER=$APP
GROUP=$USER
PASSWORD=pass
APPDIR=/opt/$APP
APIDIR=$APPDIR/api
VENVDIR=$HOMEDIR/.virtualenvs/$APP
PYTHON=python3

export DEBIAN_FRONTEND=noninteractive

dpkg --configure -a
apt-get -f install
apt-get -y update
apt-get -y autoremove
apt-get -y install mc jq

chown -Rv $USER $APPDIR

