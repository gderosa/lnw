from pathlib import Path

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

RUNTIME_BASENAME = '99-lnw-run.yaml'
RUNTIME_DIR = '/run/lnw/netplan'
RUNTIME_PATH = f"{RUNTIME_DIR}/{RUNTIME_BASENAME}"
RUNTIME_SYMLINK = f"/etc/netplan/{RUNTIME_BASENAME}"


def _init_files():
    Path(RUNTIME_DIR).mkdir(parents=True, exist_ok=True)
    if not Path(RUNTIME_PATH).is_file():
        with open(RUNTIME_PATH, 'w') as f:
            yaml.dump(YAML_DATA_BLANK, f)
    symlink = Path(RUNTIME_SYMLINK)
    if symlink.is_symlink():
        if str(symlink.resolve()) == RUNTIME_PATH:
            pass
        else:
            execute_command(['sudo', 'ln', '-sf', RUNTIME_PATH, RUNTIME_SYMLINK])
    else:
        execute_command(['sudo', 'ln', '-sf', RUNTIME_PATH, RUNTIME_SYMLINK])

def _load() -> dict:
    with open(RUNTIME_PATH) as f:
        return yaml.safe_load(f)

def _write(data):
    with open(RUNTIME_PATH, 'w') as f:
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
