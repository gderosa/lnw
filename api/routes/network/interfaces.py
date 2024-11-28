from typing import List
from enum import Enum
import json
import logging
import subprocess
from functools import cached_property

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, computed_field



# TODO: this breaks if a different server is used!
LOGGER = logging.getLogger('uvicorn')



class AddressFamily (str, Enum):
    IPv4 = 'inet'
    IPv6 = 'inet6'


class IPAddress(BaseModel):
    family:     AddressFamily   | None      = None
    addr:       str
    prefix:     int             | None      = None
    scope:      str             | None      = None
    dynamic:    bool            | None      = None

    def statically_persistable(self) -> bool:
        if self.scope == 'global':
            if self.dynamic:
                return False
            else:
                return True
        else:
            return False


class IPData(BaseModel):
    addresses: List[IPAddress]


class NetworkInterface(BaseModel):
    name:       str
    flags:      List[str]                   = []
    link_type:  str             | None      = Field(
        default=None,
        description="e.g. 'loopback', 'ether', etc."
    )
    ip:         IPData

    def statically_persistable(self) -> bool:
        if 'LOOPBACK' in self.flags:
            return False
        if self.link_type == 'loopback':
            return False
        if self.is_dhcp:
            return False
        return True

    def statically_persistable_addresses(self) -> List[IPAddress]:
        if self.statically_persistable():
            addresses = []
            for address in self.ip.addresses:
                if address.statically_persistable():
                    addresses.append(address)
            return addresses
        else:
            return []

    @computed_field
    @cached_property
    def is_dhcp(self) -> bool:
        sp = subprocess.run(
            f"ps aux | grep -v grep | grep dhc | grep {self.name}",
            shell=True, check=False, capture_output=True
        )
        if sp.returncode == 0:
            return bool(sp.stdout.strip())
        if sp.returncode == 1:
            return False
        # from grep man page, exit status = 2 for actual errors
        sp.check_returncode()




def execute_command(cmdline: List[str], logger=None):
    SUBPROCESS_RUN_OPTS = dict(check=True, text=True, capture_output=True)

    if logger:
        logger.info('Executing command: ' + repr(cmdline))
    try:
        subprocess.run(cmdline, **SUBPROCESS_RUN_OPTS)
    except subprocess.CalledProcessError as e:
        logger.error(str(e).strip())
        logger.error(e.stderr.strip())
        raise HTTPException(status_code=500, detail=(str(e) + '\n' + e.stderr))


def get_network_interfaces() -> NetworkInterface:
    iproute2_data = json.loads(subprocess.check_output(['ip', '--json', 'address', 'show']))
    netifs = []
    for iproute2_iface in iproute2_data:
        netif = NetworkInterface(
            name=iproute2_iface['ifname'],
            flags=iproute2_iface['flags'],
            link_type=iproute2_iface['link_type'],
            ip=IPData(
                addresses=[]
            )
        )
        for addr_info_el in iproute2_iface['addr_info']:
            netif.ip.addresses.append(IPAddress(
                addr=addr_info_el['local'],
                prefix=addr_info_el['prefixlen'],
                family=addr_info_el['family'],
                scope=addr_info_el['scope'],
                dynamic=(addr_info_el['dynamic'] if 'dynamic' in addr_info_el else False)
            ))
        netifs.append(netif)
    return netifs


def set_network_interfaces(netifs: List[NetworkInterface]):
    old_netifs = get_network_interfaces()
    for netif in netifs:
        old_netif = [oni for oni in old_netifs if oni.name == netif.name][0]
        for address in netif.ip.addresses:
            if address not in old_netif.ip.addresses:
                address_txt = address.addr
                if address.prefix:
                    address_txt = address_txt + '/' + str(address.prefix)
                execute_command(
                    ['sudo', 'ip', 'address', 'add', f'{address_txt}', 'dev', netif.name],
                    LOGGER
                )
    for old_netif in old_netifs:
        netif = [ni for ni in netifs if ni.name == old_netif.name][0]
        for old_address in old_netif.ip.addresses:
            if old_address not in netif.ip.addresses:
                execute_command(
                    ['sudo', 'ip', 'address', 'delete', f'{old_address.addr}/{old_address.prefix}', 'dev', netif.name],
                    LOGGER
                )



router = APIRouter(
    tags=["network/interfaces"],
    prefix="/api/v1"
)

@router.get("/network/interfaces")
async def read_netifs() -> List[NetworkInterface] :
    return get_network_interfaces()

@router.put("/network/interfaces")
async def replace_netifs(netifs: List[NetworkInterface]) -> List[NetworkInterface] :
    set_network_interfaces(netifs)
    return get_network_interfaces()

@router.post("/network/interfaces/{name}/ip/addresses")
async def netif_ip_addr_add(name: str, addr: IPAddress) -> None:
    full_addr = addr.addr
    if addr.prefix:
        full_addr = full_addr + '/' + addr.prefix
    execute_command(
        ['sudo', 'ip', 'address', 'add', f'{full_addr}', 'dev', name],
        LOGGER
    )

@router.post("/network/interfaces/persist")
async def persist_netifs() -> List[NetworkInterface]:
    netifs = get_network_interfaces()
    persisted_netifs = []
    for netif in netifs:
        if netif.is_dhcp:
            persisted_netifs.append(netif)
        elif netif.statically_persistable():
            persisted_addresses = netif.statically_persistable_addresses()
            netif.ip.addresses = persisted_addresses
            persisted_netifs.append(netif)
    return persisted_netifs


