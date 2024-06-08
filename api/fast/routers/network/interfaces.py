import subprocess
import json

from typing import List

from fastapi import APIRouter
from pydantic import BaseModel



class IPAddress(BaseModel):
    addr: str | None
    prefix: int | None

class IPData(BaseModel):
    addresses: List[IPAddress]

class NetworkInterface(BaseModel):
    name: str
    ip: IPData



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
    for old_netif in old_netifs:
        netif = [ni for ni in netifs if ni.name == old_netif.name][0]
        for old_address in old_netif.ip.addresses:
            if old_address not in netif.ip.addresses:
                print(f"ip remove {old_address} from {netif.name}")



router = APIRouter(
    tags=["network/interfaces"],
    prefix="/api/v1"
)

@router.get("/network/interfaces")
async def read_netifs():
    return get_network_interfaces()

@router.put("/network/interfaces")
async def replace_netifs(netifs: List[NetworkInterface]):
    set_network_interfaces(netifs)
    return get_network_interfaces()
