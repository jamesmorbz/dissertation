from fastapi import APIRouter, Depends
from pydantic.dataclasses import dataclass
from datetime import datetime
from core.dependencies import sqlite_client_dependency
from core.queries import read_query
from dataclasses import field
from typing import List
from fastapi.encoders import jsonable_encoder

router = APIRouter()


@dataclass
class DeviceDetails:
    hardware_name: str
    friendly_name: str
    tags: List[str] = field(default_factory=list)
    actions: List[str] = field(default_factory=list)
    last_updated: int = int(datetime.now().timestamp())


@dataclass
class DeviceStatus:
    hardware_name: str
    friendly_name: str
    device_type: str
    status: str
    last_updated: str
    uptime_seconds: int
    wifi_ssid: str
    wifi_rssi: int


@router.get(
    "/",
    response_model=List[DeviceDetails],
    tags=["All Devices"],
    summary="Get all device names",
)
async def devices():

    return [
        {
            "hardware_name": "TASMOTA_XXXXXX",
            "friendly_name": "Bedroom Light",
            "tags": ["LightBulb"],
            "actions": ["POWER_OFF", "POWER_ON"],
            "last_updated": 0,
        }
    ]


@router.put(
    "/{device_id}",
    response_model=DeviceDetails,
    tags=["Device"],
    summary="Update device metadata (friendly name, tags)",
)
async def update_device_details(device_id, device_details: DeviceDetails):
    update_item_encoded = jsonable_encoder(device_details)
    # items[device_id] = update_item_encoded TODO update Database here

    return update_item_encoded


@router.get(
    "/current_state",
    response_model=List[DeviceStatus],
    tags=["All Devices"],
    summary="Get the current status of all devices",
)
# @cache(expire=5) # TODO a bit aggresive??
async def devices_current_state(sql_client=Depends(sqlite_client_dependency)):
    query = read_query("device_last_status.sql")
    cursor = sql_client.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()

    device_list = [
        {
            "friendly_name": row[0],
            "hardware_name": row[1],
            "device_type": row[2],
            "status": row[3],
            "last_updated": row[4],
            "uptime_seconds": row[5],
            "wifi_ssid": row[6],
            "wifi_rssi": row[7],
        }
        for row in rows
    ]

    return device_list
