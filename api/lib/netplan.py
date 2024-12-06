import yaml

from .command import execute as execute_command


# TODO: non ethernets? persistence?


YAML_COMMENT = '''
# This file is used by LNW. It is edited, applied and then "emptied".
# It is for network settings that are not persisted.
#
'''

YAML_DATA_BLANK = {
    'network': {
        'version': 2,
        'ethernets': {
        }
    }
}

# Must be created by setup script(s), owned so we do not need sudo and system commands
RUNTIME_FILE = '/etc/netplan/zz-lnw-runtime.yaml'


def write_blank():
    with open(RUNTIME_FILE, 'w') as f:
        f.write(YAML_COMMENT)
        yaml.dump(YAML_DATA_BLANK, f)


class NetplanInterface:
    def __init__(self, ifname: str, logger=None):
        self.ifname = ifname
        self.logger = logger
        self.yaml_data = YAML_DATA_BLANK
        self.yaml_data['network']['ethernets'][ifname] = {}

    def set_dhcp4(self, is_on: bool):
        self.yaml_data['network']['ethernets'][self.ifname]['dhcp4'] = is_on

    def write(self, persist: bool):
        if persist:
            raise NotImplementedError
        else:
            with open(RUNTIME_FILE, 'w') as f:
                f.write(YAML_COMMENT)
                yaml.dump(self.yaml_data, f)

    def apply(self, persist: bool):
        if persist:
            raise NotImplementedError
        # Do not persist!
        self.write(persist=False)
        execute_command([
            'sudo', 'netplan', 'apply'
        ], self.logger)
        write_blank()




