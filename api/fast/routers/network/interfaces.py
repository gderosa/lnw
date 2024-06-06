from typing import List

from fastapi import APIRouter
from pydantic import BaseModel


class IPData(BaseModel):
    addresses: List[str]

class NetworkInterface(BaseModel):
    name: str
    ip: IPData



network_interfaces = [
        {
            "name": "lo",
            "ip": {
                "addresses": [
                    "127.0.0.1", "::1"
                ]
            }
        },
        {
            "name": "eth0",
            "ip": {
                "addresses": [
                    "201.202.203.204", "2001::2008"
                ]
            },
        },
        {
            "name": "eth1",
            "ip": {
                "addresses": [
                    "192.168.1.1", "fe80::1111"
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
