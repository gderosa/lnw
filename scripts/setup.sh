#!/bin/sh

APPNAME=lnw
HOME=/var/lib/$APPNAME
CONFIGDIR=$HOME
USERNAME=$APPNAME
PASSWORD=pass
APPDIR=/opt/$APPNAME
APIDIR=$APPDIR/api/fast
VENVDIR=$HOME/.virtualenvs/$APPNAME
PYTHON=python3

export DEBIAN_FRONTEND=noninteractive

dpkg --configure -a
apt-get -f install
apt-get -y update
apt-get -y upgrade
apt-get -y install python3 python3-venv

adduser --system --shell /bin/bash --home $HOME --group $USERNAME && \
        echo "$USER:$PASSWORD" | chpasswd

install -v $APPDIR/api/examples/sys/sudoers /etc/sudoers.d/lnw

su - $USERNAME -c "$PYTHON -m venv $VENVDIR"
su - $USERNAME -c "
    cd $APIDIR/
    source $VENVDIR/bin/activate
    pip install -r requirements.txt
"

