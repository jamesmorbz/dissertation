from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

router = APIRouter()

class DataPoint(BaseModel):
    Time: str
    Power: int

def generate_data(start_date, num_points, interval_minutes):
    data = []
    for i in range(num_points):
        date = start_date + timedelta(minutes=i * interval_minutes)
        data.append({
            "Time": date.isoformat(),
            "Power": random.randint(100, 300)
        })
    return data

@router.get("/data", response_model=list[DataPoint])
async def get_data():
    start_date = datetime(2024, 6, 11, 22, 3, 14)
    data = generate_data(start_date, 100, 1)  # 100 points, 1 minute apart
    return data