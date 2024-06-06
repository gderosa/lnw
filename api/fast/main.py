from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .routers import easyrsa
from .routers.network import interfaces as network_interfaces


app = FastAPI()

app.mount("/ui", StaticFiles(directory="ui"), name="ui")

app.include_router(easyrsa.router)
app.include_router(network_interfaces.router)


@app.get("/api/v1")
async def root():
    return {"message": "Hello World"}

