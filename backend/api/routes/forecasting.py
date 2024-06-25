from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
from pydantic.dataclasses import dataclass
from typing import List

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
