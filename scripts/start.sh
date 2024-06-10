#!/bin/sh

APPNAME=lnw
HOME=/var/lib/$APPNAME
CONFIGDIR=$HOME
USERNAME=$APPNAME
PASSWORD=pass
APPDIR=/opt/$APPNAME
VENVDIR=$HOME/.virtualenvs/$APPNAME
PYTHON=python3

su - $USERNAME -c "
    cd $APPDIR
    source $VENVDIR/bin/activate
    fastapi dev --host 0.0.0.0 api/fast/main.py
"

