import subprocess
import json

from typing import List

from fastapi import APIRouter
from pydantic import BaseModel


class IPAddress(BaseModel):
    addr: str
    prefix: int | None

class IPData(BaseModel):
    addresses: List[IPAddress]

class NetworkInterface(BaseModel):
    name: str
    ip: IPData


def get_network_interfaces():
    iproute2_data = json.loads(subprocess.check_output(['ip', '--json', 'address', 'show']))
    netifs = []
    for iproute2_iface in iproute2_data:
        netif = dict(
            name=iproute2_iface['ifname'],
            ip=dict(
                addresses=list()
            )
        )
        for addr_info_el in iproute2_iface['addr_info']:
            netif['ip']['addresses'].append(dict(
                addr=addr_info_el['local'],
                prefix=addr_info_el['prefixlen']
            ))
        netifs.append(netif)
    return netifs



network_interfaces = get_network_interfaces()



router = APIRouter(
    tags=["network/interfaces"],
    prefix="/api/v1"
)


@router.get("/network/interfaces")
async def read_netifs():
    return network_interfaces

@router.put("/network/interfaces")
async def replace_netifs(netifs: List[NetworkInterface]):
    global network_interfaces
    network_interfaces = netifs
    return []
