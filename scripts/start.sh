#!/bin/sh

# Run as lnw user from .. (project root)

APPNAME=lnw
VENVDIR=$HOME/.virtualenvs/$APPNAME

source $VENVDIR/bin/activate
fastapi dev --host 0.0.0.0 api/fast/main.py

