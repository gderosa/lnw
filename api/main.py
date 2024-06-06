from fastapi import FastAPI

from .routers import easyrsa


app = FastAPI()


app.include_router(easyrsa.router)


@app.get("/")
async def root():
    return {"message": "Hello World"}

