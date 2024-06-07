from typing import List

from fastapi import APIRouter
from pydantic import BaseModel


class IPAddress(BaseModel):
    addr: str
    prefix: int

class IPData(BaseModel):
    addresses: List[IPAddress]

class NetworkInterface(BaseModel):
    name: str
    ip: IPData



network_interfaces = [
        {
            "name": "lo",
            "ip": {
                "addresses": [
                    {"addr": "127.0.0.1", "prefix": 8},
                    {"addr": "::1", "prefix": 128}
                ]
            }
        },
        {
            "name": "eth0",
            "ip": {
                "addresses": [
                    {"addr": "201.202.203.204", "prefix": 24},
                    {"addr": "2001::2008", "prefix": 96}
                ]
            },
        },
        {
            "name": "eth1",
            "ip": {
                "addresses": [
                    {"addr": "192.168.1.1", "prefix": 24},
                    {"addr": "fe80::1111", "prefix": 64}
                ]
            }
        }
    ]


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
    return network_interfaces
