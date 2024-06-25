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

@dataclass
class Dataset:
    device_name: str
    data: List[DataPoint]

@dataclass
class Summary:
    device_name: str
    end_timestamp: int
    start_timestamp: int
    total_power: int
    average_power: float


def generate_data(start_timestamp, lookback_minutes, interval_seconds):
    data = []
    
    for i in range(lookback_minutes):
        date = start_timestamp - (i * interval_seconds)
        data.append(DataPoint(date, random.randint(100, 300)))
    
    return data

@router.get("/{device_id}", response_model=Dataset, tags=["Device"], summary="Get Power Usage Data for a Device")
async def get_data(device_id: str, start_timestamp: int = int(datetime.now().timestamp()), lookback_minutes: int = 240, interval_seconds: int = 60):
    # start_timestamp = datetime(2024, 6, 11, 22, 3, 14).timestamp()
    data = generate_data(start_timestamp, lookback_minutes, interval_seconds)  # 100 points, 1 minute apart
    
    return {
        "device_name": device_id,
        "data": data
    }

@router.get("/{device_id}/summary", response_model=Summary, tags=["Device"], summary="Get Power Usage Summary for a Device")
async def get_summary(device_id: str, end_date: str = datetime.now().strftime('%d-%m-%Y'), start_date: str = (datetime.now()- timedelta(days=1)).strftime('%d-%m-%Y')):
    try:
        start_dt = datetime.strptime(start_date, "%d-%m-%Y")
        end_dt = datetime.strptime(end_date, "%d-%m-%Y")
    except ValueError:
        raise HTTPException(status_code=400, detail="Incorrect date format, should be DD-MM-YYYY")

    if start_dt >= end_dt:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    total_minutes = int((end_dt - start_dt).total_seconds() / 60)
    total_power = sum(random.randint(100, 300) for _ in range(total_minutes))  # Simulated total
    average_power = total_power / total_minutes

    summary = {
        "device_name": device_id,
        "end_timestamp": int(start_dt.timestamp()),
        "start_timestamp": int(end_dt.timestamp()),
        "total_power": total_power,
        "average_power": average_power
    }

    return summary