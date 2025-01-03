from typing import List, Optional
from enum import Enum
import json
import subprocess
from functools import cached_property

from pydantic import BaseModel, Field, computed_field
from fastapi import APIRouter
from fastapi.responses import FileResponse, PlainTextResponse

from ...lib.command import execute as execute_command, LOGGER
from ...lib.netplan import set_dhcp4, persist_interfaces, restore_interfaces, PERSIST_PATH


class AddressFamily (str, Enum):
    IPv4 = 'inet'
    IPv6 = 'inet6'

class UpDown (str, Enum):
    up = 'up'
    down = 'down'

class OnOff (str, Enum):  # TODO: this looks like general purpose; move elsewhere?
    on = 'on'
    off = 'off'

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
        if self.is_dhcp4:
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
    def is_dhcp4(self) -> bool:  # TODO: IPV6 whataboutism
        sp = subprocess.run(
            R"ps aux | grep -v grep | grep dhc | egrep -v '\-\w*6' | grep {self.name}",
            shell=True, check=False, capture_output=True
        )
        if sp.returncode == 0:
            return bool(sp.stdout.strip())
        if sp.returncode == 1:
            return self.is_dhcp4_networkd()
        # from grep man page, exit status = 2 for actual errors
        sp.check_returncode()

    def is_dhcp4_networkd(self):
        networkd_data = json.loads(
            subprocess.check_output(['networkctl', '--json=short', 'status', self.name]))
        return "DHCPv4Client" in networkd_data

    def is_up(self):
        return 'UP' in self.flags
    def is_down(self):
        return not self.is_up()

    def bring(self, updown: UpDown):
        execute_command(
            ['sudo', 'ip', 'link', 'set', updown, 'dev', self.name],
            LOGGER
        )


def get_network_interfaces() -> List[NetworkInterface]:
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


def get_network_interface(name: str) -> Optional[NetworkInterface]:
    iproute2_iface = json.loads(subprocess.check_output(['ip', '--json', 'address', 'show', 'dev', name]))[0]
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
    return netif


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

@router.get("/network/interfaces/{name}")
async def read_netif(name: str) -> Optional[NetworkInterface]:
    return get_network_interface(name)

# Not used in the new UI?
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

@router.post("/network/interfaces/{name}/ip/link/set/{updown}")
async def netif_ip_link_set_updown(name: str, updown: UpDown) -> None:
    netif = get_network_interface(name)
    netif.bring(updown)

@router.post("/network/interfaces/{ifname}/dhcp/set/{onoff}")
async def netif_dhcp_set(ifname: str, onoff: OnOff) -> None:
    iface = get_network_interface(ifname)
    was_down = iface.is_down()
    set_dhcp4(ifname, onoff == 'on')
    if was_down and onoff == 'off':  # preven Netplan side effect
        iface.bring('down')

@router.delete("/network/interfaces/{name}/ip/addresses/{addr}/{prefix}")
async def netif_ip_addr_del(name: str, addr: str, prefix: int) -> None:
    execute_command(
        ['sudo', 'ip', 'address', 'delete', f'{addr}/{str(prefix)}', 'dev', name],
        LOGGER
    )

@router.get("/network/interfaces/persist/file/path")
async def get_persisted_netifs_filepath():
    return PlainTextResponse(PERSIST_PATH)

@router.get("/network/interfaces/persist/file")
async def get_persisted_netifs_raw():
    """
    Show the managed [Netplan](https://netplan.io/) config file, which will look like e.g.
    ```
    network:
        ethernets:
            eth0:
                dhcp4: true
            eth1:
                addresses:
                    - 1.2.3.6/24
                    - 2.2.3.5/24
                optional: true
            eth2:
                dhcp4: true
        version: 2
    ```
    """
    return FileResponse(PERSIST_PATH)

@router.post("/network/interfaces/persist")
async def persist_netifs() -> None:
    netifs = get_network_interfaces()
    persisted_netifs = []
    for netif in netifs:
        if netif.is_dhcp4:
            persisted_netifs.append(netif)
        elif netif.statically_persistable():
            persisted_addresses = netif.statically_persistable_addresses()
            netif.ip.addresses = persisted_addresses
            persisted_netifs.append(netif)
    persist_interfaces(persisted_netifs)

@router.post("/network/interfaces/restore")
async def restore_netifs() -> None:
    restore_interfaces()
