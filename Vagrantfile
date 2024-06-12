# Inspired by https://github.com/vemarsas/wiedii-bootstrap/blob/main/Vagrantfile

DEBIAN_BOX    = 'boxomatic/debian-13'
RAM_MB        = 1024
MESSAGE       = <<END
  ssh -p 2201 lnw@localhost
  ssh -p 2202 lnw@localhost
  cd /opt/lnw
  source /var/lib/lnw/.virtualenv/lnw/bin/activate
  fastapi dev --host 0.0.0.0 api/fast/main.py
END

def assign_ram(vmcfg, megabytes)
  vmcfg.vm.provider 'virtualbox' do |vb|
    vb.memory = megabytes
  end
end

#                +-----------------------------------+
#                |                                   |
#  Internet --- Host -(*)- LNW --- internal-a-1 -(*)- LNWb --- internal-b-1
#                           |
#                           +----- internal-a-2
#
#  (*) default gw

Vagrant.configure('2') do |config|
  config.vm.box = DEBIAN_BOX

  assign_ram                  config,   RAM_MB

  config.vm.provision         'file',   source: '.',                          destination: '/tmp/lnw'
  config.vm.provision         'shell',  inline: 'mv -v /tmp/lnw /opt/lnw'
  config.vm.provision         'shell',  path:   'scripts/setup.sh'
  config.vm.provision         'shell',  path:   'scripts/setup_dev.sh'
  config.vm.provision         'file',   source: 'scripts/files/sshd_config',  destination: '/tmp/sshd_config_lnw'
  config.vm.provision         'shell',  inline: 'mv -v /tmp/sshd_config_lnw /etc/ssh/sshd_config.d/lnw.conf'

  config.vm.post_up_message = MESSAGE

  config.vm.define 'lnw', primary: true do |lnw|
    lnw.vm.hostname = 'lnw'

    lnw.vm.network "forwarded_port", guest: 22,   host: 2201
    lnw.vm.network 'forwarded_port', guest: 8000, host: 8001

    # NIC #1 is the default NAT interface, with forwarded ports above

    # NIC #2
    lnw.vm.network 'private_network',
      auto_config: false,
      virtualbox__intnet: 'internal-a-1'

    # NIC #3
    lnw.vm.network 'private_network',
      auto_config: false,
      virtualbox__intnet: 'internal-a-2'
  end

  config.vm.define 'lnwb', autostart: false do |lnwb|
    lnwb.vm.hostname = 'lnwb'

    # lnwb.vm.network "forwarded_port", guest: 22,   host: 2202
    lnwb.vm.network 'forwarded_port', guest: 8000, host: 8002

    # NIC #1 is the default NAT interface, with forwarded ports above, connected to host machine
    lnwb.vm.network "public_network",
        use_dhcp_assigned_default_route: true

    # NIC #2  Connected to the other network appliance
    lnwb.vm.network 'private_network',
      auto_config: false,
      virtualbox__intnet: 'internal-a-1'

    # NIC #3
    lnwb.vm.network 'private_network',
      auto_config: false,
      virtualbox__intnet: 'internal-b-1'
  end
end


