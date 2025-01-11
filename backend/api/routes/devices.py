from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from core.dependencies import influxdb_client_dependency, sql_client_dependency
from typing import List, Annotated
from influxdb_client import InfluxDBClient
from influxdb_client.client.flux_table import TableList
from core.queries.influx_queries import InfluxDBQueries
from utils.query_helper import InfluxHelper
from utils.user import get_current_user
from core.models import User, DeviceMapping
from typing import Optional
from sqlalchemy.orm import Session
from fastapi_cache.decorator import cache
from utils.cache import cache_entry_user_pk

router = APIRouter()


class DeviceUpdate(BaseModel):
    friendly_name: Optional[str] = Field(
        None, max_length=30, description="User Friendly Plug 'Nickname'"
    )
    tag: Optional[str] = Field(None, description="")
    room: Optional[str] = Field(None, description="")


class DeviceDetailsResponse(BaseModel):
    hardware_name: str
    friendly_name: Optional[str]
    tag: Optional[str]


class DeviceMappingResponse(BaseModel):
    hardware_name: str
    friendly_name: str


class DeviceStatus(BaseModel):
    timestamp: str
    hardware_name: str
    wifi_name: str
    room: Optional[str]
    tag: Optional[str]
    friendly_name: Optional[str]
    power: bool
    uptime: int
    wifi_rssi: int
    wifi_signal: int


@router.put(
    "/{hardware_name}",
    # response_model=DeviceDetailsResponse,
    tags=["Device"],
    summary="Update device metadata (friendly name, tag)",
)
async def update_device_details(
    hardware_name: str,
    device_update: DeviceUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(sql_client_dependency),
):
    device = (
        db.query(DeviceMapping)
        .filter(
            DeviceMapping.user_id == current_user.id,
            DeviceMapping.hardware_name == hardware_name,
        )
        .first()
    )
    if not device:
        device = DeviceMapping(user_id=current_user.id, hardware_name=hardware_name)
        db.add(device)

    for key, value in device_update.model_dump(exclude_unset=True).items():
        setattr(device, key, value)

    db.commit()
    db.refresh(device)

    return {"message": "Device updated successfully", "device": device}


@router.get(
    "/",
    response_model=List[DeviceStatus],
    tags=["All Devices"],
    summary="Get the current status of all devices",
)
@cache(expire=60, key_builder=cache_entry_user_pk)  # TODO a bit aggresive??
async def devices_current_state(
    current_user: Annotated[
        User, Depends(get_current_user)
    ],  # TODO: add user validation to influxDB data get
    influx_client: InfluxDBClient = Depends(influxdb_client_dependency),
    db: Session = Depends(sql_client_dependency),
):
    query: str = InfluxDBQueries.get_device_status_query()
    response: TableList = InfluxHelper.query_influx(influx_client, query)
    fields = ["_time", "_field", "_value", "hardware_name", "wifi_name"]
    rows = InfluxHelper.convert_resp_to_dict(response, fields)

    devices = (
        db.query(DeviceMapping).filter(DeviceMapping.user_id == current_user.id).all()
    )
    devices_pk_hw_name = {device.hardware_name: device for device in devices}

    devices = {}
    for row in rows:
        device_name = row["hardware_name"]
        if device_name not in devices:
            devices[device_name] = {
                "timestamp": row["_time"],
                "hardware_name": device_name,
                "wifi_name": row["wifi_name"],
                row["_field"]: row["_value"],
            }
            device_mapping: DeviceMapping = devices_pk_hw_name.get(device_name)
            if device_mapping:
                devices[device_name]["friendly_name"] = device_mapping.friendly_name
                devices[device_name]["tag"] = device_mapping.tag
                devices[device_name]["room"] = device_mapping.room
            else:
                devices[device_name]["friendly_name"] = None
                devices[device_name]["tag"] = None
                devices[device_name]["room"] = None
        else:
            devices[device_name][row["_field"]] = row["_value"]

    return list(devices.values())


@router.get(
    "/info/{hardware_name}",
    tags=["Device"],
    summary="Get the DeviceMapping a given device",
)
async def devices_current_state(
    hardware_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(sql_client_dependency),
):
    device = (
        db.query(DeviceMapping)
        .filter(
            DeviceMapping.user_id == current_user.id,
            DeviceMapping.hardware_name == hardware_name,
        )
        .first()
    )
    if not device:
        raise HTTPException(
            status_code=404, detail=f"No friendly name set for: {hardware_name}"
        )

    return device


@router.get(
    "/device_reliability", tags=["All Devices"], summary="Reliability of Devices"
)
async def device_reliability(
    current_user: Annotated[
        User, Depends(get_current_user)
    ],  # TODO: add user validation to influxDB data get
    influx_client: InfluxDBClient = Depends(influxdb_client_dependency),
):
    query = InfluxDBQueries.get_row_count_per_device_query()
    response: TableList = InfluxHelper.query_influx(influx_client, query)
    fields = ["_value", "hardware_name", "_start"]
    rows = InfluxHelper.convert_resp_to_dict(response, fields)

    results = {}

    for row in rows:
        hardware_name = row["hardware_name"]
        if (
            "." in row["_start"]
        ):  # Happens if timestamp isn't flush on the hour. (If it's not a whole hour window)
            continue
        if hardware_name not in results:
            results[hardware_name] = {
                "reliabilities": [],
                "avg": 0,
                "best": 0,
                "worst": 100,
            }

        reliability = round((row["_value"] / 720) * 100, 2)

        results[hardware_name]["reliabilities"].append(reliability)
        results[hardware_name]["avg"] += reliability

    for hardware_name in results:
        results[hardware_name]["avg"] = round(
            results[hardware_name]["avg"]
            / len(results[hardware_name]["reliabilities"]),
            2,
        )
        results[hardware_name]["best"] = max(results[hardware_name]["reliabilities"])
        results[hardware_name]["worst"] = min(results[hardware_name]["reliabilities"])
        results[hardware_name].pop("reliabilities")

    return results


@router.get(
    "/device_mappings",
    tags=["All Devices"],
    summary="Get the DeviceMapping for all devices",
)
async def devices_current_state(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(sql_client_dependency),
):
    devices = (
        db.query(DeviceMapping).filter(DeviceMapping.user_id == current_user.id).all()
    )
    if not devices:
        raise HTTPException(status_code=404, detail=f"No Devices Mapped")

    return devices
