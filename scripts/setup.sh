#!/bin/sh

APP=lnw
DATADIR=/var/lib/$APP
HOMEDIR=$DATADIR
USER=$APP
GROUP=$USER
PASSWORD=pass
APPDIR=/opt/$APP
APIDIR=$APPDIR/api/fast
VENVDIR=$HOMEDIR/.virtualenvs/$APP
PYTHON=python3

export DEBIAN_FRONTEND=noninteractive

dpkg --configure -a
apt-get -f install
apt-get -y update
apt-get -y upgrade
apt-get -y autoremove
apt-get -y install sudo
apt-get -y install python3 python3-venv

adduser --system --shell /bin/bash --home $HOMEDIR --group $GROUP && \
        echo "$USER:$PASSWORD" | chpasswd

chmod o-rwx $HOMEDIR

install -v $APPDIR/scripts/files/sudoers /etc/sudoers.d/$USER

su - $USER -c "$PYTHON -m venv $VENVDIR"
su - $USER -c "
    cd $APIDIR/
    source $VENVDIR/bin/activate
    pip install -r requirements.txt
"

systemctl enable systemd-networkd
systemctl start systemd-networkd
systemctl status systemd-networkd

