from fastapi import APIRouter, Depends
from datetime import datetime
from pydantic.dataclasses import dataclass
from typing import List
from core.dependencies import get_influxdb_client
from influxdb_client import InfluxDBClient
import json
from influxdb_client.client.flux_table import TableList

router = APIRouter()


@dataclass
class DataPoint:
    _unix: int
    _value: int | None  # TODO maybe null values should be 0?
    _time: str


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


# TODO - If we remove device name from the above summary data class we should add the below data class
@dataclass
class SummarySet:
    device_name: str
    data: List[Summary]


# TODO ensure these are the supported units of time supported  duration_lit        = int_lit duration_unit .
# duration_unit       = "s" | "m" | "h" | "d" | "w" .
# TODO can play around with time truncation if we ever need
# |> truncateTimeColumn(unit: {interval})
# TODO use start_timestamp


@router.get(
    "/device/{device_id}",
    response_model=Dataset,
    tags=["Device"],
    summary="Get Power Usage Data for a Device",
)
async def get_device_data(
    device_id: str,  # TODO remove this default value
    start_timestamp: int = int(datetime.now().timestamp()),
    lookback: str = "15m",
    interval: str = "1m",
    aggregation: str = "max",
    influx_client: InfluxDBClient = Depends(get_influxdb_client),
):
    query_api = influx_client.query_api()
    # TODO how can I store influx queries in a more elegant way?
    query = f"""
    from(bucket: "metrics")
        |> range(start: -{lookback})
        |> filter(fn: (r) => r["_measurement"] == "wattage")
        |> filter(fn: (r) => r["_field"] == "power")
        |> filter(fn: (r) => r["hardware_name"] == "{device_id}")
        |> aggregateWindow(every: {interval}, fn: {aggregation}, createEmpty: true)
        |> map(fn: (r) => ({{ r with _unix: uint(v: r._time) }}))
    """
    response: TableList = query_api.query(query)
    data = json.loads(response.to_json(["_unix", "_value", "_time"]))[1:-1]
    # TODO - currently removing -1 as the timestamp takes a different format and is skewed off the minute - this may have side effects
    return {"device_name": device_id, "data": data}


@router.get(
    "/device/{device_id}/daily_data",
    response_model=Dataset,
    tags=["Device"],
    summary="TBC",
)
async def get_device_daily_data(
    device_id: str,
    lookback_days: int = 7,
    influx_client: InfluxDBClient = Depends(get_influxdb_client),
):
    query_api = influx_client.query_api()
    query = f"""
        from(bucket: "metrics")
        |> range(start: -{lookback_days}d)
        |> filter(fn: (r) => r["_measurement"] == "wattage")
        |> filter(fn: (r) => r["_field"] == "power")
        |> filter(fn: (r) => r["hardware_name"] == "{device_id}")
        |> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
        |> map(fn: (r) => ({{ r with _unix: uint(v: r._time) }}))
    """
    response: TableList = query_api.query(query)
    data = json.loads(response.to_json(["_unix", "_value", "_time"]))
    return {"device_name": device_id, "data": data}


@router.get(  # TODO - I don't know what's happening with the routes
    "/daily_data",
    response_model=List[Dataset],
    tags=["Summary", "Device"],
    summary="TBC1",
)
async def get_daily_data(
    lookback_days: int = 7,
    influx_client: InfluxDBClient = Depends(get_influxdb_client),
):
    query_api = influx_client.query_api()
    query = f"""
        from(bucket: "metrics")
        |> range(start: -{lookback_days}d)
        |> filter(fn: (r) => r["_measurement"] == "wattage")
        |> filter(fn: (r) => r["_field"] == "power")
        |> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
        |> map(fn: (r) => ({{ r with _unix: uint(v: r._time) }}))
    """
    response: TableList = query_api.query(query)
    rows = json.loads(response.to_json(["hardware_name", "_unix", "_value", "_time"]))
    data = {}
    for row in rows:
        device_name = row["hardware_name"]
        data_point = DataPoint(row["_unix"], row["_value"], row["_time"])
        if device_name not in data:
            data[device_name] = {"device_name": device_name, "data": [data_point]}
        else:
            data[device_name]["data"].append(data_point)

    return data.values()
