from fastapi import APIRouter


router = APIRouter(
    tags=["easyrsa"]
)


@router.get("/easyrsa/pkis")
async def read_pkis():
    return [{"pkiname": "Rick"}, {"pkiname": "Morty"}, {"pkiname": "Hannah"}]

