#!/bin/sh

APPNAME=lnw
HOME=/var/lib/$APPNAME
CONFIGDIR=$HOME
USERNAME=$APPNAME
PASSWORD=pass
APPDIR=/opt/$APPNAME
VENVDIR=$HOME/.virtualenvs/$APPNAME
PYTHON=python3

apt-get -y update
apt-get -y upgrade
apt-get -y install python3

adduser --system --shell /bin/bash --home $HOME --group $USERNAME && \
        echo "$USER:$PASSWORD" | chpasswd

su - $USERNAME -c "$PYTHON -m venv $VENVDIR"
su - $USERNAME -c <<END
    cd $APPDIR
    source $VENVDIR/bin/activate
    pip install -r requirements.txt
END

