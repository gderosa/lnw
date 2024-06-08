import subprocess
import json
import logging

from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


# Constants and globals

# TODO: this breaks if a different server is used!
LOGGER = logging.getLogger('uvicorn')

SUBPROCESS_RUN_OPTS = dict(check=True, text=True, capture_output=True)


# Models

class IPAddress(BaseModel):
    addr: str
    prefix: int | None

class IPData(BaseModel):
    addresses: List[IPAddress]

class NetworkInterface(BaseModel):
    name: str
    ip: IPData


# Web app <-> System Networking

def get_network_interfaces() -> NetworkInterface:
    iproute2_data = json.loads(subprocess.check_output(['ip', '--json', 'address', 'show']))
    netifs = []
    for iproute2_iface in iproute2_data:
        netif = NetworkInterface(
            name = iproute2_iface['ifname'],
            ip = IPData(
                addresses = []
            )
        )
        for addr_info_el in iproute2_iface['addr_info']:
            netif.ip.addresses.append(IPAddress(
                addr=addr_info_el['local'],
                prefix=addr_info_el['prefixlen']
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
                cmd = ['sudo', 'ip', 'address', 'add', f'{address_txt}', 'dev', netif.name]
                LOGGER.info(repr(cmd))
                subprocess.run(cmd, **SUBPROCESS_RUN_OPTS)
    for old_netif in old_netifs:
        netif = [ni for ni in netifs if ni.name == old_netif.name][0]
        for old_address in old_netif.ip.addresses:
            if old_address not in netif.ip.addresses:
                cmd = ['sudo', 'ip', 'address', 'delete', f'{old_address.addr}/{old_address.prefix}', 'dev', netif.name]
                LOGGER.info(repr(cmd))
                subprocess.run(cmd, **SUBPROCESS_RUN_OPTS)


#URL routes

router = APIRouter(
    tags=["network/interfaces"],
    prefix="/api/v1"
)

@router.get("/network/interfaces")
async def read_netifs():
    return get_network_interfaces()

@router.put("/network/interfaces")
async def replace_netifs(netifs: List[NetworkInterface]):
    try:
        set_network_interfaces(netifs)
    except subprocess.CalledProcessError as e:
        LOGGER.error(str(e).strip())
        LOGGER.error(e.stderr.strip())
        raise HTTPException(status_code=500, detail=(str(e) + '\n' + e.stderr))
    return get_network_interfaces()
