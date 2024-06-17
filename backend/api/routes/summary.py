from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

router = APIRouter()

class Summary(BaseModel):
    start_time: str
    end_time: str
    total_power: int
    average_power: float

@router.get("/summary", response_model=Summary)
async def get_summary():
    start_time = datetime(2024, 6, 11, 22, 3, 14)
    end_time = start_time + timedelta(hours=1)
    total_power = sum(random.randint(100, 300) for _ in range(60))  # Simulated total for an hour
    average_power = total_power / 60
    summary = {
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "total_power": total_power,
        "average_power": average_power
    }
    return summary