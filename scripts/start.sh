#!/bin/sh

APPNAME=lnw
USERNAME=$APPNAME
APPDIR=/opt/$APPNAME
VENVDIR=$HOME/.virtualenvs/$APPNAME

su - $USERNAME -c "
    cd $APPDIR
    source $VENVDIR/bin/activate
    fastapi dev --host 0.0.0.0 api/fast/main.py
"

