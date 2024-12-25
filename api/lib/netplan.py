from copy import deepcopy
from pathlib import Path

import yaml

from .command import execute as execute_command

# https://netplan.readthedocs.io/en/stable/netplan-yaml/

YAML_DATA_BLANK = {
    'network': {
        'version': 2,
        'ethernets': {

        }
    }
}

RUNTIME_BASENAME = '99-lnw-run.yaml'
RUNTIME_DIR = '/run/lnw/netplan'
RUNTIME_PATH = f"{RUNTIME_DIR}/{RUNTIME_BASENAME}"
RUNTIME_SYMLINK = f"/etc/netplan/{RUNTIME_BASENAME}"

PERSIST_BASENAME = '90-lnw.yaml'
PERSIST_PATH = f"/etc/netplan/{PERSIST_BASENAME}"


def _init_files():

    # Non-persistent (via /run fs)
    Path(RUNTIME_DIR).mkdir(parents=True, exist_ok=True)
    if not Path(RUNTIME_PATH).is_file():
        with open(RUNTIME_PATH, 'w') as f:
            yaml.dump(YAML_DATA_BLANK, f)
    symlink = Path(RUNTIME_SYMLINK)
    if not (
            symlink.is_symlink() and str(symlink.resolve()) == RUNTIME_PATH
    ):
        execute_command(['sudo', 'ln', '-sf',           RUNTIME_PATH, RUNTIME_SYMLINK])
        execute_command(['sudo', 'chown', 'lnw:lnw',    RUNTIME_PATH])
        execute_command(['sudo', 'chmod', 'go-rwx',     RUNTIME_PATH])

    # Persistent config
    if not Path(PERSIST_PATH).is_file():
        execute_command(['sudo', 'touch',               PERSIST_PATH])
        execute_command(['sudo', 'chown', 'lnw:lnw',    PERSIST_PATH])
        execute_command(['sudo', 'chmod', 'go-rwx',     PERSIST_PATH])

        with open(RUNTIME_PATH, 'w') as f:
            yaml.dump(YAML_DATA_BLANK, f)

def _load() -> dict:  # TODO: rename _load_runtime()?
    with open(RUNTIME_PATH) as f:
        return yaml.safe_load(f)

def _write(data, path=RUNTIME_PATH):
    with open(path, 'w') as f:
            yaml.dump(data, f)

def _set_dhcp4(ifname, is_on: bool):
    data = _load()
    if not ifname in data['network']['ethernets']:
        data['network']['ethernets'][ifname] = {}
    data['network']['ethernets'][ifname]['dhcp4'] = is_on
    _write(data)

def _apply():
    execute_command(['sudo', 'netplan', 'apply'])

def set_dhcp4(ifname, is_on: bool):
    _init_files()
    _set_dhcp4(ifname, is_on)
    _apply()

def persist_interfaces(interfaces):
    data = deepcopy(YAML_DATA_BLANK)
    for iface in interfaces:
        data['network']['ethernets'][iface.name] = {}
        if iface.is_dhcp4:
            data['network']['ethernets'][iface.name]['dhcp4'] = True
        else:
            data['network']['ethernets'][iface.name]['addresses'] = []
            for addr in iface.ip.addresses:
                data['network']['ethernets'][iface.name]['addresses'].append(f"{addr.addr}/{addr.prefix}")
        if iface.is_down():
            data['network']['ethernets'][iface.name]['activation-mode'] = 'off'
    _init_files()
    _write(data,            PERSIST_PATH)
    _write(YAML_DATA_BLANK, RUNTIME_PATH)

def restore_interfaces():
    _init_files()
    _write(YAML_DATA_BLANK, RUNTIME_PATH)
    _apply()
