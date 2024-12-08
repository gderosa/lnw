from typing import List
import subprocess
import logging

from fastapi import HTTPException


LOGGER = logging.getLogger('uvicorn')


def execute(cmdline: List[str], logger=LOGGER):
    SUBPROCESS_RUN_OPTS = dict(check=True, text=True, capture_output=True)

    if logger:
        logger.info('Executing command: ' + repr(cmdline))
    try:
        cp = subprocess.run(cmdline, **SUBPROCESS_RUN_OPTS)
        if logger:
            logger.info(cp.stdout)
            logger.warning(cp.stderr)
    except subprocess.CalledProcessError as e:
        logger.error(str(e).strip())
        logger.error(e.stderr.strip())
        raise HTTPException(status_code=500, detail=(str(e) + '\n' + e.stderr))


