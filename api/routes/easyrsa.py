from fastapi import APIRouter


router = APIRouter(
    tags=["easyrsa"],
    prefix="/api/v1"
)


@router.get("/easyrsa/pkis")
async def read_pkis():
    return [{"pkiname": "Rick"}, {"pkiname": "Morty"}, {"pkiname": "Hannah"}]

