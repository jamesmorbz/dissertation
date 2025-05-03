from fastapi import APIRouter, Depends
from pydantic.dataclasses import dataclass
import requests
from core.models import User
from typing import Annotated
from utils.user import get_current_user
import json
from pydantic import BaseModel, Field
from fastapi_cache.decorator import cache
from datetime import datetime, timezone, timedelta

router = APIRouter()


@dataclass
class DataPoint:
    timestamp: int
    power: int
    tag: str  # real point or extrapolated point (e.g extrapolated can be dotted line in frontend)


class CarbonIntensity(BaseModel):
    forecast: int
    actual: int
    index: str


class CarbonIntensityResponse(BaseModel):
    from_: str = Field(..., alias="from")
    to: str
    intensity: CarbonIntensity


@router.get(
    "/carbon-intensity",
    response_model=CarbonIntensityResponse,
    tags=["Carbon"],
    summary="Show the current carbon intensity at the current moment in time",
)
@cache(expire=7200)
def carbon_intensity(
    current_user: Annotated[User, Depends(get_current_user)],
):
    # if current_user.postcode: TODO: Use user Location
    #     response = requests.get(f'https://api.carbonintensity.org.uk/regional/postcode/{current_user.postcode}')
    #     x=1
    # else:
    response = requests.get("https://api.carbonintensity.org.uk/intensity")
    data = json.loads(response.content)["data"][0]

    return data


@router.get(
    "/carbon-intensity/full-forecast",
    # response_model=TBC,
    # tags=[" "],
    summary="Show future carbon intensity forecast from now to now + 72 hours",
)
def forecast(
    current_user: Annotated[User, Depends(get_current_user)],
):
    now = datetime.now(timezone.utc)
    datetime_now = now.strftime("%Y-%m-%dT%H:%MZ")
    response = requests.get(
        f"https://api.carbonintensity.org.uk/intensity/{datetime_now}/fw48h"
    )
    data = json.loads(response.content)["data"]
    output = [{item["from"]: item["intensity"]["forecast"]} for item in data]

    return output


@router.get(
    "/carbon-intensity/historical-values/{lookback_days}",
    summary="Show historical carbon intensity values for the last X days",
)
def forecast(
    lookback_days: int,
    current_user: Annotated[User, Depends(get_current_user)],
):
    now = datetime.now(timezone.utc)
    delta = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    datetime_now = now.strftime("%Y-%m-%dT%H:%MZ")
    datetime_to = delta.strftime("%Y-%m-%dT%H:%MZ")
    response = requests.get(
        f"https://api.carbonintensity.org.uk/intensity/{datetime_to}/{datetime_now}"
    )
    data = json.loads(response.content)["data"]
    output = [{item["from"]: item["intensity"]["forecast"]} for item in data]

    return output
