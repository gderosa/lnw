from typing import List
import subprocess

from fastapi import HTTPException


def execute(cmdline: List[str], logger=None):
    SUBPROCESS_RUN_OPTS = dict(check=True, text=True, capture_output=True)

    if logger:
        logger.info('Executing command: ' + repr(cmdline))
    try:
        subprocess.run(cmdline, **SUBPROCESS_RUN_OPTS)
    except subprocess.CalledProcessError as e:
        logger.error(str(e).strip())
        logger.error(e.stderr.strip())
        raise HTTPException(status_code=500, detail=(str(e) + '\n' + e.stderr))


