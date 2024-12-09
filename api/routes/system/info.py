
import subprocess
import hashlib

from fastapi import APIRouter
from pydantic import BaseModel

from ...lib.command import execute as execute_command



class SystemInfo(BaseModel):
    hostname:       str
    machine_hash:   str


router = APIRouter(
    tags=["system/info"],
    prefix="/api/v1"
)

@router.get("/system/info")
async def read_sysinfo() -> SystemInfo:
    hostname = str(subprocess.check_output(['hostname']).strip(), 'utf-8')
    machine_id = ''
    with open('/etc/machine-id', 'r') as f:
        machine_id = str(f.read().strip())
    # https://www.devdoc.net/linux/man7.org-20170728/man5/machine-id.5.html#:~:text=This%20ID%20uniquely%20identifies%20the,must%20not%20be%20used%20directly.
    hash_me = hostname + machine_id
    h = hashlib.new('sha256')
    h.update(bytes(hash_me, 'utf-8'))
    machine_hash = h.hexdigest()
    return SystemInfo(
        hostname=hostname,
        machine_hash=machine_hash
    )
