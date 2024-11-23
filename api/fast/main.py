from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from .routes import easyrsa
from .routes.network import interfaces as network_interfaces


app = FastAPI()

app.mount("/ui", StaticFiles(directory="ui"), name="ui")

app.include_router(easyrsa.router)
app.include_router(network_interfaces.router)


@app.get("/api")
async def api_root():
    return RedirectResponse("/docs")

@app.get("/")
async def ui_home():
    return RedirectResponse("/ui/index.html")

