# Inspired to https://github.com/vemarsas/wiedii-bootstrap/blob/main/Vagrantfile

DEBIAN_BOX  = 'boxomatic/debian-13'
RAM_MB      = 1024

def assign_ram(vmcfg, megabytes)
  vmcfg.vm.provider 'virtualbox' do |vb|
    vb.memory = megabytes
  end
end

#                +----------------------------------+
#                |                                  |
#  Internet --- Host --- LNW --- internal-a-1 --- LNWb(*) --- internal-b-1
#                         |
#                         +----- internal-a-2
#
#  (*) default route towards internal-a-1, not the host

Vagrant.configure('2') do |config|
  config.vm.define 'lnw', primary: true do |lnw|
    lnw.vm.box = DEBIAN_BOX
    assign_ram lnw, RAM_MB
    lnw.vm.hostname 'lnw'
    lnw.vm.synced_folder '.', '/opt/lnw'

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
    lnwb.vm.box = DEBIAN_BOX
    assign_ram lnwb, RAM_MB
    lnwb.vm.hostname 'lnwb'
    lnwb.vm.synced_folder '.', '/opt/lnw'

    lnwb.vm.network 'forwarded_port', guest: 8000, host: 8002

    # NIC #1 is the default NAT interface, with forwarded ports above

    # NIC #2
    lnw.vm.network 'private_network',
      auto_config: false,
      virtualbox__intnet: 'internal-a-1'

    # NIC #3
    lnw.vm.network 'private_network',
      auto_config: false,
      virtualbox__intnet: 'internal-b-1'
  end
end


