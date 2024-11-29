#!/bin/sh

# Run as lnw user from .. (project root)

APPNAME=lnw
VENVDIR=$HOME/.virtualenvs/$APPNAME

. $VENVDIR/bin/activate
fastapi dev --host 0.0.0.0 api/main.py

