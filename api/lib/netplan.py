import yaml

from .command import execute as execute_command


# TODO: non ethernets? persistence?


YAML_DATA_BLANK = {
    'network': {
        'version': 2,
        'ethernets': {

        }
    }
}

RUN_FILE = '/run/lnw/99-lnw-run.yaml'


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
                yaml.dump(self.yaml_data, f)

    def apply(self, persist: bool):
        if persist:
            raise NotImplementedError
        # Do not persist!
        self.write(persist=False)
        execute_command([
            'sudo', 'netplan', 'apply'
        ], self.logger)




