from fastapi import APIRouter
from pydantic.dataclasses import dataclass

router = APIRouter()


@dataclass
class DataPoint:
    timestamp: int
    power: int


@router.get(
    "",
    # response_model=TBC,
    # tags=[" "],
    summary="Estimate the future usage of devices",
)
async def forecast():
    return "Filler"
