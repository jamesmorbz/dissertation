from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
from fastapi_cache.decorator import cache
import sqlite3
import requests

router = APIRouter()


@router.post("/{device_id}/TOGGLE_POWER", tags=["Device"], summary="Toggle the power of a device on/off")
async def toggle_power(device_id):
    DUMMY_LOCAL_IP = "192.168.8.164"
    requests.get(f"http://{DUMMY_LOCAL_IP}/cm?cmnd=Power%20TOGGLE")
    return

@router.put("/{device_id}/COMMAND", summary="Issue a command to the device")
async def update_telemetry_frequency(device_id, frequency: int ,tags=["Device"]):
    if frequency < 10 or frequency > 3600:
        raise HTTPException(status_code=400, detail="TelePeriod cannot be greater than 3600 or less than 10")
    # DUMMY_LOCAL_IP = "192.168.8.164"
    # requests.get(f"http://{DUMMY_LOCAL_IP}/cm?cmnd=TelePeriod%20{frequency}")
    return