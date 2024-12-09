
import subprocess

from fastapi import APIRouter
from pydantic import BaseModel

from ...lib.command import execute as execute_command



class SystemInfo(BaseModel):
    hostname:       str
    machine_id:     str  # hex string, should it be an int?


router = APIRouter(
    tags=["system/info"],
    prefix="/api/v1"
)

@router.get("/system/info")
async def read_sysinfo() -> SystemInfo:
    hostname = subprocess.check_output(['hostname']).strip()
    machine_id = ''
    with open('/etc/machine-id') as f:
        machine_id = f.read().strip()
    return SystemInfo(
        hostname=hostname,
        machine_id=machine_id
    )
