from fastapi import APIRouter, Depends
from pydantic.dataclasses import dataclass
from datetime import datetime
from core.dependencies import influxdb_client_dependency, sqlite_client_dependency
from typing import List
from fastapi.encoders import jsonable_encoder
from influxdb_client import InfluxDBClient
from influxdb_client.client.flux_table import TableList
import json
from sqlite3 import Connection, Error

router = APIRouter()


@dataclass
class DeviceDetails:
    hardware_name: str
    friendly_name: str
    tag: str | None = (
        ""  # TODO this overwrites the value of tag on response of /devices GET endpoint
    )
    last_updated: int = int(datetime.now().timestamp())


@dataclass
class DeviceStatus:
    timestamp: str
    hardware_name: str
    wifi_name: str
    power: bool
    uptime: int
    wifi_rssi: int
    wifi_signal: int


@router.get(
    "/",
    response_model=List[DeviceDetails],
    tags=["All Devices"],
    summary="Get all device names",
)
async def devices(sql_client: Connection = Depends(sqlite_client_dependency)):
    cur = sql_client.cursor()
    cur.execute("SELECT * FROM device_mappings GROUP BY hardware_name")
    raw_data = cur.fetchall()
    data = []
    for row in raw_data:
        data.append(
            {
                "hardware_name": row[0],
                "friendly_name": row[1],
                "tags": row[2],
                "last_updated": row[3],
            }
        )

    return data


@router.put(
    "/",
    response_model=DeviceDetails,
    tags=["Device"],
    summary="Update device metadata (friendly name, tag)",
)
async def update_device_details(
    device_details: DeviceDetails,
    sql_client: Connection = Depends(sqlite_client_dependency),
):
    try:
        update_item_encoded = jsonable_encoder(device_details)
        device_id = update_item_encoded["hardware_name"]

        cur = sql_client.cursor()

        cur.execute("SELECT hardware_name FROM device_mappings GROUP BY hardware_name")
        hardware_names = [row[0] for row in cur.fetchall()]

        if device_id not in hardware_names:
            cur.execute(
                """
                INSERT INTO device_mappings (hardware_name, friendly_name, tag, last_updated)
                VALUES (:hardware_name, :friendly_name, :tag, :last_updated)
                """,
                update_item_encoded,
            )
        else:
            cur.execute(
                """
                UPDATE device_mappings 
                SET friendly_name = :friendly_name, 
                    tag = :tag, 
                    last_updated = :last_updated
                WHERE hardware_name = :hardware_name
                """,
                update_item_encoded,
            )

        sql_client.commit()
        # cur.execute("SELECT * FROM device_mappings WHERE hardware_name = ?", (device_id,))
        # updated_record = cur.fetchone()
        # print("Updated record:", updated_record)

        # Return the updated device details
        return update_item_encoded

    except Error as e:
        print(f"An error occurred: {e}")
        sql_client.rollback()
        raise e


@router.get(
    "/current_state",
    response_model=List[DeviceStatus],
    tags=["All Devices"],
    summary="Get the current status of all devices",
)
# @cache(expire=5) # TODO a bit aggresive??
async def devices_current_state(
    influx_client: InfluxDBClient = Depends(influxdb_client_dependency),
):
    query_api = influx_client.query_api()
    # TODO how can I store influx queries in a more elegant way?
    query = f"""
    from(bucket: "metrics")
        |> range(start: -30d)
        |> filter(fn: (r) => r["_measurement"] == "status")
        |> filter(fn: (r) => r["_field"] == "power" or r["_field"] == "uptime" or r["_field"] == "wifi_rssi" or r["_field"] == "wifi_signal")
        |> last()
    """
    response: TableList = query_api.query(query)

    rows = json.loads(
        response.to_json(["_time", "_field", "_value", "hardware_name", "wifi_name"])
    )
    devices = {}
    for row in rows:
        device_name = row["hardware_name"]
        if device_name not in devices:
            devices[device_name] = {
                "timestamp": row["_time"],
                "hardware_name": row["hardware_name"],
                "wifi_name": row["wifi_name"],
                row["_field"]: row["_value"],
            }
        else:
            devices[device_name][row["_field"]] = row["_value"]

    return devices.values()
