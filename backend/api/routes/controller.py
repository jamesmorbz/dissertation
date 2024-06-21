from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
from fastapi_cache.decorator import cache
import sqlite3
import requests

router = APIRouter()


@router.put("/device/{device_id}/TOGGLE_POWER")
async def device_controller(device_id):
    DUMMY_LOCAL_IP = "192.168.8.164"
    requests.get(f"http://{DUMMY_LOCAL_IP}/cm?cmnd=Power%20TOGGLE")
    return