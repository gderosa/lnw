from fastapi import APIRouter


router = APIRouter(
    tags=["network", "network/interfaces"],
    prefix="/api/v1"
)


@router.get("/network/interfaces")
async def read_netifs():
    return [
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
            "name": "lo",
            "ip": {
                "addresses": [
                    "192.168.1.1", "fe80::1111"
                ]
            }
        }
    ]
