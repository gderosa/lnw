#!/bin/sh

APPNAME=lnw
DATADIR=/var/lib/$APPNAME
USERNAME=$APPNAME
GROUPNAME=$USERNAME
PASSWORD=$USERNAME
APPDIR=`dirname $0`/..
APIDIR=$APPDIR/api
PYTHON=python3

export DEBIAN_FRONTEND=noninteractive

dpkg --configure -a
apt-get -f install
apt-get -y update
apt-get -y upgrade
apt-get -y autoremove
apt-get -y install sudo
apt-get -y install python3 python3-venv

(adduser --system --shell /bin/bash --home $DATADIR --group $GROUPNAME  && \
        echo "$USERNAME:$PASSWORD" | chpasswd )                             || \
        mkdir -p $DATADIR  # if the user already exists, the HOME may be different

HOMEDIR=$(su - $USERNAME -c 'echo $HOME')
VENVDIR=$HOMEDIR/.virtualenvs/$APPNAME

chmod o-rwx $DATADIR

install -v $APPDIR/scripts/files/sudoers        /etc/sudoers.d/$USERNAME    --mode=0640
install -v $APPDIR/scripts/files/sysctl.conf    /etc/sysctl.d/$APPNAME.conf --mode=0644
systemctl force-reload procps

su $USERNAME -c "$PYTHON -m venv $VENVDIR"
su $USERNAME -c "
    cd $APIDIR/
    source $VENVDIR/bin/activate
    pip install -r requirements.txt
"

# Netplan.io migration -- see also https://gist.github.com/mss/7a8e048dd51e5ef928039f1450ba8f31
apt-get -y install systemd-resolved netplan.io
systemctl unmask systemd-networkd
systemctl start systemd-networkd
systemctl unmask systemd-resolved
systemctl start systemd-resolved
if [ -f /etc/network/interfaces ]; then
    ENABLE_TEST_COMMANDS=1 netplan migrate
fi
apt-get -y purge avahi-daemon ifupdown resolvconf
chmod -v go-rwx /etc/netplan/*.yaml
netplan apply
# ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf  # done automatically
