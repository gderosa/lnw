from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .routers import easyrsa


app = FastAPI()

app.mount("/ui", StaticFiles(directory="ui"), name="ui")

app.include_router(easyrsa.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}

