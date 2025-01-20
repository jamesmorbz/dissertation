from fastapi import APIRouter
from pydantic.dataclasses import dataclass

router = APIRouter()


@dataclass
class DataPoint:
    timestamp: int
    power: int
    tag: str  # real point or extrapolated point (e.g extrapolated can be dotted line in frontend)


@router.get(
    "",
    # response_model=TBC,
    # tags=[" "],
    summary="Estimate the future usage of devices",
)
def forecast():
    return "Filler"
