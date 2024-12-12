
import subprocess
import hashlib
from functools import cached_property

from fastapi import APIRouter
from pydantic import BaseModel, computed_field

from ...lib.command import execute as execute_command


class SystemInfo(BaseModel):

    @computed_field
    @cached_property
    def hostname(self) -> str:
        hostname = str(subprocess.check_output(['hostname']).strip(), 'utf-8')
        return hostname
    
    @computed_field
    @cached_property
    def machine_hash(self) -> int:
        hostname = self.hostname
        machine_id = ''
        with open('/etc/machine-id', 'r') as f:
            machine_id = str(f.read().strip())
        # https://www.devdoc.net/linux/man7.org-20170728/man5/machine-id.5.html#:~:text=This%20ID%20uniquely%20identifies%20the,must%20not%20be%20used%20directly.
        hash_me = hostname + machine_id
        h = hashlib.new('sha256')
        h.update(bytes(hash_me, 'utf-8'))
        machine_hash = int.from_bytes(h.digest(), 'little')
        return machine_hash


router = APIRouter(
    tags=["system/info"],
    prefix="/api/v1"
)

@router.get("/system/info")
async def read_sysinfo() -> SystemInfo:
    return SystemInfo()
